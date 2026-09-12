"""Camera-only API client: no database identifiers, credentials never logged."""
import random
import time
import uuid
import requests
from config import configuracao_api

class CameraAPIError(RuntimeError):
    def __init__(self, message, *, retryable=False, retry_after=None):
        super().__init__(message)
        self.retryable = retryable
        self.retry_after = retry_after

class CredencialInvalida(CameraAPIError):
    pass

def _retry_after(response):
    try:
        return min(300, max(1, int(response.headers.get("Retry-After", "1"))))
    except (ValueError, TypeError):
        return 1

def enviar_medicao(quantidade_pessoas, *, session=None, sleep=time.sleep, max_tentativas=3):
    url, key = configuracao_api()
    if isinstance(quantidade_pessoas, bool) or not isinstance(quantidade_pessoas, int) or quantidade_pessoas < 0:
        raise ValueError("A quantidade deve ser um inteiro não negativo.")
    if max_tentativas < 1:
        raise ValueError("Informe ao menos uma tentativa.")
    client = session or requests
    # An opaque measurement UUID makes retries idempotent. It is not a database ID.
    data = {"quantidadePessoas": quantidade_pessoas, "medicaoId": str(uuid.uuid4())}
    for tentativa in range(max_tentativas):
        error = None
        try:
            response = client.post(url + "/cameras/medicoes", json=data,
                                   headers={"X-Camera-Key": key}, timeout=(5, 10), allow_redirects=False)
            status = response.status_code
            if 200 <= status < 300:
                return None
            if status in (401, 403):
                raise CredencialInvalida("Dispositivo não autorizado. Verifique ativação e credencial no painel.")
            if status == 429:
                error = CameraAPIError("Limite de envios atingido.", retryable=True, retry_after=_retry_after(response))
            elif status >= 500:
                error = CameraAPIError("Backend temporariamente indisponível.", retryable=True)
            else:
                raise CameraAPIError(f"Medição rejeitada pelo backend (HTTP {status}).")
        except requests.Timeout:
            error = CameraAPIError("Tempo limite ao enviar medição.", retryable=True)
        except requests.ConnectionError:
            error = CameraAPIError("Falha de rede ao conectar ao backend.", retryable=True)
        except requests.RequestException:
            raise CameraAPIError("Não foi possível preparar a requisição.") from None
        if tentativa + 1 == max_tentativas:
            raise error from None
        sleep(error.retry_after or min(30, 2 ** tentativa + random.random()))
