import os
import unittest
from unittest.mock import Mock, patch
import requests
import api
import config
import detector

class CameraClientTests(unittest.TestCase):
    def setUp(self):
        self.environment=patch.dict(os.environ, {"HOSPEASY_API_URL":"http://localhost:8080","HOSPEASY_CAMERA_KEY":"only-test-key"},clear=True)
        self.environment.start()
        self.addCleanup(self.environment.stop)
    def response(self, status, **headers):
        return Mock(status_code=status,headers=headers)
    def test_missing_configuration(self):
        for key in ("HOSPEASY_API_URL","HOSPEASY_CAMERA_KEY"):
            with patch.dict(os.environ,{key:""}):
                self.assertRaises(ValueError,config.configuracao_api)
    def test_no_unit_id_and_payload(self):
        session=Mock();session.post.return_value=self.response(204)
        api.enviar_medicao(4,session=session)
        args,kwargs=session.post.call_args
        self.assertEqual(args[0],"http://localhost:8080/cameras/medicoes")
        self.assertEqual(set(kwargs["json"]),{"quantidadePessoas","medicaoId"})
        self.assertEqual(kwargs["timeout"],(5,10))
    def test_credentials_are_fatal_and_sanitized(self):
        for status in (401,403):
            session=Mock();session.post.return_value=self.response(status)
            with self.assertRaises(api.CredencialInvalida) as failure:
                api.enviar_medicao(4,session=session,sleep=Mock())
            self.assertNotIn("only-test-key",str(failure.exception))
            self.assertEqual(session.post.call_count,1)
    def test_retry_idempotence_429_and_5xx(self):
        session=Mock();session.post.side_effect=[self.response(429,**{"Retry-After":"2"}),self.response(503),self.response(204)]
        sleep=Mock();api.enviar_medicao(7,session=session,sleep=sleep)
        sleep.assert_any_call(2)
        self.assertEqual(len({x.kwargs["json"]["medicaoId"] for x in session.post.call_args_list}),1)
        self.assertEqual(session.post.call_count,3)
    def test_timeout_and_network_exhaustion(self):
        for error in (requests.Timeout("only-test-key"),requests.ConnectionError("only-test-key")):
            session=Mock();session.post.side_effect=error
            with self.assertRaises(api.CameraAPIError) as failure:
                api.enviar_medicao(7,session=session,sleep=Mock())
            self.assertNotIn("only-test-key",str(failure.exception))
            self.assertEqual(session.post.call_count,3)
    def test_invalid_quantity_and_url(self):
        for qty in (-1,True,1.5):
            self.assertRaises(ValueError,api.enviar_medicao,qty,session=Mock())
        for url in ("ftp://localhost","https://user:pass@localhost","https://localhost?secret=x"):
            with patch.dict(os.environ,{"HOSPEASY_API_URL":url}):
                self.assertRaises(ValueError,config.configuracao_api)
    def test_detector_uses_same_threshold_and_only_people(self):
        model=Mock(return_value=[Mock(boxes=[1,2])])
        with patch.object(detector,"obter_modelo",return_value=model):
            self.assertEqual(detector.contar_pessoas("frame"),2)
            kwargs=model.call_args.kwargs
            self.assertEqual(kwargs["classes"],[0])
            self.assertEqual(kwargs["conf"],config.CONFIANCA_MINIMA)
            self.assertFalse(kwargs["verbose"])
    def test_model_path_and_missing_model(self):
        self.assertTrue(config.MODELO_PATH.is_absolute())
        with patch.object(detector,"_modelo",None),patch.object(detector,"MODELO_PATH") as path:
            path.is_file.return_value=False
            self.assertRaises(RuntimeError,detector.obter_modelo)
if __name__=="__main__":
    unittest.main()
