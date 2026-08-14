import cv2
import time
import logging

from detector import contar_pessoas
from api import enviar_medicao
from config import (
    CAMERA_INDEX,
    LARGURA_CAMERA,
    ALTURA_CAMERA,
    INTERVALO_MEDICAO,
    ARQUIVO_LOG
)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(
            ARQUIVO_LOG,
            encoding="utf-8"
        ),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


def realizar_medicao():
    logger.info("Medição iniciada.")

    camera = cv2.VideoCapture(CAMERA_INDEX)

    if not camera.isOpened():
        raise RuntimeError(
            "Não foi possível abrir a webcam."
        )

    camera.set(
        cv2.CAP_PROP_FRAME_WIDTH,
        LARGURA_CAMERA
    )

    camera.set(
        cv2.CAP_PROP_FRAME_HEIGHT,
        ALTURA_CAMERA
    )

    frame = None

    try:
        # Dá alguns frames para exposição/autofoco estabilizarem
        for _ in range(10):
            sucesso, frame = camera.read()

            if not sucesso:
                raise RuntimeError(
                    "Não foi possível capturar imagem da webcam."
                )

    finally:
        camera.release()

    logger.info("Frame capturado com sucesso.")

    quantidade = contar_pessoas(frame)

    logger.info(
        "Pessoas detectadas: %s",
        quantidade
    )

    enviar_medicao(quantidade)

    logger.info(
        "Medição enviada com sucesso para o backend."
    )


def main():
    logger.info("HospEasy Camera iniciado.")
    logger.info(
        "Intervalo entre medições: %s segundos.",
        INTERVALO_MEDICAO
    )

    while True:
        try:
            realizar_medicao()

        except Exception as erro:
            logger.exception(
                "Erro durante a medição: %s",
                erro
            )

        logger.info(
            "Aguardando próxima medição."
        )

        time.sleep(INTERVALO_MEDICAO)


if __name__ == "__main__":
    main()