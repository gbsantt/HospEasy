import logging
import time
from logging.handlers import RotatingFileHandler
from statistics import median
from config import (CAMERA_INDEX, LARGURA_CAMERA, ALTURA_CAMERA, INTERVALO_MEDICAO,
                    QUANTIDADE_AMOSTRAS, INTERVALO_AMOSTRAS, ARQUIVO_LOG, configuracao_api)
from detector import contar_pessoas, obter_modelo
from api import enviar_medicao, CredencialInvalida

logger = logging.getLogger(__name__)

def configurar_logs():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[RotatingFileHandler(ARQUIVO_LOG, maxBytes=2_000_000, backupCount=3, encoding="utf-8"),
                  logging.StreamHandler()])

def coletar_contagens(*, mostrar=False, ao_detectar=None):
    import cv2
    camera = cv2.VideoCapture(CAMERA_INDEX)
    try:
        if not camera.isOpened():
            raise RuntimeError("Não foi possível abrir a webcam.")
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, LARGURA_CAMERA)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, ALTURA_CAMERA)
        camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        for _ in range(10):
            if not camera.read()[0]:
                raise RuntimeError("Não foi possível inicializar a webcam.")
        contagens = []
        for numero in range(QUANTIDADE_AMOSTRAS):
            # V4L2 may ignore BUFFERSIZE; discard queued frames after inference.
            for _ in range(5):
                if not camera.grab():
                    raise RuntimeError("Não foi possível atualizar a imagem da webcam.")
            sucesso, frame = camera.read()
            if not sucesso:
                raise RuntimeError("Não foi possível capturar imagem.")
            inicio = time.perf_counter()
            resultado = contar_pessoas(frame, mostrar=mostrar)
            quantidade, imagem = resultado if mostrar else (resultado, frame)
            contagens.append(quantidade)
            if ao_detectar is not None:
                ao_detectar(quantidade, imagem, time.perf_counter() - inicio)
            if numero + 1 < QUANTIDADE_AMOSTRAS:
                time.sleep(INTERVALO_AMOSTRAS)
    finally:
        camera.release()
    return contagens


def realizar_medicao():
    contagens = coletar_contagens()
    enviar_medicao(int(median(contagens)))
    logger.info("Medição aceita pelo backend.")

def main():
    configuracao_api()
    obter_modelo()
    configurar_logs()
    logger.info("Câmera iniciada. Intervalo: %.0f segundos.", INTERVALO_MEDICAO)
    while True:
        try:
            realizar_medicao()
        except CredencialInvalida:
            logger.error("Dispositivo não autorizado. Execução interrompida; revise a credencial no painel.")
            return
        except KeyboardInterrupt:
            return
        except Exception:
            # No traceback/request object: third-party errors may contain request details.
            logger.error("Falha na medição. Verifique webcam, rede e configuração.")
        time.sleep(INTERVALO_MEDICAO)

if __name__ == "__main__":
    main()
