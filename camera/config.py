"""Shared camera configuration. Paths are independent of the working directory."""
import os
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
CAMERA_INDEX = int(os.getenv("HOSPEASY_CAMERA_INDEX", "0"))
LARGURA_CAMERA = int(os.getenv("HOSPEASY_CAMERA_WIDTH", "1280"))
ALTURA_CAMERA = int(os.getenv("HOSPEASY_CAMERA_HEIGHT", "720"))
CONFIANCA_MINIMA = float(os.getenv("HOSPEASY_CONFIDENCE", "0.5"))
INTERVALO_MEDICAO = float(os.getenv("HOSPEASY_INTERVAL_SECONDS", "180"))
QUANTIDADE_AMOSTRAS = int(os.getenv("HOSPEASY_SAMPLES", "5"))
INTERVALO_AMOSTRAS = float(os.getenv("HOSPEASY_SAMPLE_INTERVAL_SECONDS", "0.5"))
ARQUIVO_LOG = str(BASE_DIR / "hospeasy_camera.log")
MODELO_PATH = Path(os.getenv("HOSPEASY_MODEL_PATH", "yolov8n.pt"))
MODELO_PATH = (MODELO_PATH if MODELO_PATH.is_absolute() else BASE_DIR / MODELO_PATH).resolve()

def validar_detector():
    if not 0 < CONFIANCA_MINIMA <= 1:
        raise ValueError("HOSPEASY_CONFIDENCE deve estar entre 0 e 1.")
    if INTERVALO_MEDICAO < 1 or QUANTIDADE_AMOSTRAS < 1 or INTERVALO_AMOSTRAS < 0:
        raise ValueError("Intervalos ou quantidade de amostras inválidos.")
    if LARGURA_CAMERA < 1 or ALTURA_CAMERA < 1:
        raise ValueError("Resolução da câmera inválida.")

def configuracao_api():
    url = os.getenv("HOSPEASY_API_URL", "").strip().rstrip("/")
    key = os.getenv("HOSPEASY_CAMERA_KEY", "").strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError("Configure HOSPEASY_API_URL com uma URL HTTP(S) sem credenciais ou parâmetros.")
    if not key or len(key) > 256 or any(c.isspace() for c in key):
        raise ValueError("Configure uma HOSPEASY_CAMERA_KEY válida.")
    validar_detector()
    return url, key
