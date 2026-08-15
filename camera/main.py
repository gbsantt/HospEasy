import cv2
import time
import logging

from statistics import median

from detector import contar_pessoas
from api import enviar_medicao
from config import (
    CAMERA_INDEX,
    LARGURA_CAMERA,
    ALTURA_CAMERA,
    INTERVALO_MEDICAO,
    QUANTIDADE_AMOSTRAS,
    INTERVALO_AMOSTRAS,
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

    inicio_medicao = time.perf_counter()

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

    contagens = []

    try:

        # Frames iniciais para a câmera
        # ajustar exposição e foco
        for _ in range(10):

            sucesso, _ = camera.read()

            if not sucesso:
                raise RuntimeError(
                    "Não foi possível inicializar a webcam."
                )

        # Captura várias amostras
        for numero in range(QUANTIDADE_AMOSTRAS):

            sucesso, frame = camera.read()

            if not sucesso:
                raise RuntimeError(
                    "Não foi possível capturar imagem da webcam."
                )

            inicio_processamento = time.perf_counter()

            quantidade = contar_pessoas(frame)

            fim_processamento = time.perf_counter()

            tempo_processamento = (
                    fim_processamento
                    - inicio_processamento
            )

            contagens.append(quantidade)

            logger.info(
                "Amostra %s/%s: %s pessoas | processamento: %.2fs",
                numero + 1,
                QUANTIDADE_AMOSTRAS,
                quantidade,
                tempo_processamento
            )

            if numero < QUANTIDADE_AMOSTRAS - 1:

                time.sleep(
                    INTERVALO_AMOSTRAS
                )

    finally:

        camera.release()

    quantidade_final = int(
        median(contagens)
    )

    logger.info(
        "Contagens obtidas: %s",
        contagens
    )

    logger.info(
        "Resultado da mediana: %s pessoas.",
        quantidade_final
    )

    enviar_medicao(
        quantidade_final
    )

    logger.info(
        "Medição enviada com sucesso para o backend."
    )

    fim_medicao = time.perf_counter()

    tempo_total = (
            fim_medicao
            - inicio_medicao
    )

    logger.info(
        "Medição concluída em %.2fs.",
        tempo_total
    )


def main():

    logger.info(
        "HospEasy Camera iniciado."
    )

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

        time.sleep(
            INTERVALO_MEDICAO
        )


if __name__ == "__main__":
    main()