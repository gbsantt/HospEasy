import unittest
from unittest.mock import Mock, patch
import numpy as np
import detector
import main


class DetectorTests(unittest.TestCase):
    def test_people_threshold_class_selection_and_nms(self):
        output = np.zeros((1, 84, 5040), dtype=np.float32)
        for i, x in enumerate([100, 101, 300, 400, 500]):
            output[0, :4, i] = [x, 100, 50, 80]
        output[0, 4, :5] = [.9, .8, .9, .4, .8]
        output[0, 5, 4] = .95  # A different class wins, despite high person score.
        with patch.object(detector, 'CONFIANCA_MINIMA', .5):
            boxes, _ = detector.selecionar_pessoas(output)
        self.assertEqual(len(boxes), 2)
        self.assertEqual(set(boxes[:, 0]), {75, 275})

    def test_empty_scene_and_incompatible_or_invalid_output(self):
        output = np.zeros((1, 84, 5040), dtype=np.float32)
        self.assertEqual(len(detector.selecionar_pessoas(output)[0]), 0)
        self.assertRaises(RuntimeError, detector.selecionar_pessoas, np.zeros((1, 84, 8400)))
        output[0, 4, 0] = np.nan
        self.assertRaises(RuntimeError, detector.selecionar_pessoas, output)

    def test_letterbox_preserves_ratio_padding_and_rgb(self):
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        frame[:] = [0, 0, 255]
        blob, scale, left, top = detector.preparar_imagem(frame)
        self.assertEqual(blob.shape, (1, 3, 384, 640))
        self.assertEqual((scale, left, top), (.5, 0, 12))
        np.testing.assert_allclose(blob[0, :, 0, 0], 114 / 255)
        np.testing.assert_allclose(blob[0, :, 12, 0], [1, 0, 0])

    def test_failed_capture_never_sends_zero_and_releases_camera(self):
        camera = Mock()
        camera.read.return_value = (False, None)
        with patch('cv2.VideoCapture', return_value=camera), patch.object(main, 'enviar_medicao') as send:
            self.assertRaises(RuntimeError, main.realizar_medicao)
        send.assert_not_called()
        camera.release.assert_called_once()

    def test_median_rejects_outlier_and_releases_camera(self):
        camera = Mock()
        camera.read.return_value = (True, np.zeros((10, 10, 3), dtype=np.uint8))
        with patch('cv2.VideoCapture', return_value=camera), \
             patch.object(main, 'contar_pessoas', side_effect=[2, 2, 30, 3, 2]), \
             patch.object(main, 'QUANTIDADE_AMOSTRAS', 5), \
             patch.object(main.time, 'sleep'), \
             patch.object(main, 'enviar_medicao') as send:
            main.realizar_medicao()
        send.assert_called_once_with(2)
        camera.release.assert_called_once()


if __name__ == '__main__':
    unittest.main()
