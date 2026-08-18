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
    ARQUIVO_LOG,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(ARQUIVO_LOG, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)

NOME_JANELA = "HospEasy Camera - Preview"


def main():

    logger.info("HospEasy Camera com preview iniciado.")
    logger.info(
        "Intervalo entre medições: %s segundos.",
        INTERVALO_MEDICAO,
    )

    camera = cv2.VideoCapture(CAMERA_INDEX)

    if not camera.isOpened():
        raise RuntimeError("Não foi possível abrir a webcam.")

    camera.set(cv2.CAP_PROP_FRAME_WIDTH, LARGURA_CAMERA)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, ALTURA_CAMERA)

    cv2.namedWindow(NOME_JANELA, cv2.WINDOW_NORMAL)

    for _ in range(10):
        sucesso, _ = camera.read()

        if not sucesso:
            camera.release()
            raise RuntimeError(
                "Não foi possível inicializar a webcam."
            )

    contagens = []
    ultimo_instante_amostra = 0.0

    inicio_ciclo_medicao = (
        time.monotonic() - INTERVALO_MEDICAO
    )

    ultima_contagem = None
    ultima_medicao_enviada = None
    mensagem_status = "Aguardando medição..."

    try:

        while True:

            sucesso, frame = camera.read()

            if not sucesso:
                raise RuntimeError(
                    "Não foi possível capturar imagem da webcam."
                )

            agora = time.monotonic()

            if agora - inicio_ciclo_medicao >= INTERVALO_MEDICAO:

                if not contagens:
                    logger.info("Medição iniciada.")
                    ultimo_instante_amostra = (
                        agora - INTERVALO_AMOSTRAS
                    )
                    mensagem_status = "Coletando amostras..."

                if (
                    agora - ultimo_instante_amostra
                    >= INTERVALO_AMOSTRAS
                    and len(contagens) < QUANTIDADE_AMOSTRAS
                ):

                    inicio_processamento = time.perf_counter()

                    quantidade = contar_pessoas(frame)

                    fim_processamento = time.perf_counter()

                    tempo_processamento = (
                        fim_processamento - inicio_processamento
                    )

                    ultima_contagem = quantidade
                    contagens.append(quantidade)
                    ultimo_instante_amostra = agora

                    logger.info(
                        "Amostra %s/%s: %s pessoas | processamento: %.2fs",
                        len(contagens),
                        QUANTIDADE_AMOSTRAS,
                        quantidade,
                        tempo_processamento,
                    )

                if len(contagens) >= QUANTIDADE_AMOSTRAS:

                    quantidade_final = int(
                        median(contagens)
                    )

                    logger.info(
                        "Contagens obtidas: %s",
                        contagens,
                    )

                    logger.info(
                        "Resultado da mediana: %s pessoas.",
                        quantidade_final,
                    )

                    mensagem_status = "Enviando medição..."

                    try:

                        enviar_medicao(quantidade_final)

                        ultima_medicao_enviada = quantidade_final
                        mensagem_status = (
                            f"Enviado: {quantidade_final} pessoas"
                        )

                        logger.info(
                            "Medição enviada com sucesso para o backend."
                        )

                    except Exception as erro:

                        mensagem_status = "Erro ao enviar medição"

                        logger.exception(
                            "Erro ao enviar medição: %s",
                            erro,
                        )

                    contagens.clear()
                    inicio_ciclo_medicao = time.monotonic()

            preview = frame.copy()

            cv2.putText(
                preview,
                "HospEasy - Preview da camera",
                (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            if ultima_contagem is not None:
                cv2.putText(
                    preview,
                    f"Ultima amostra: {ultima_contagem} pessoa(s)",
                    (20, 70),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.65,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA,
                )

            if ultima_medicao_enviada is not None:
                cv2.putText(
                    preview,
                    f"Ultima medicao enviada: {ultima_medicao_enviada}",
                    (20, 105),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.65,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA,
                )

            cv2.putText(
                preview,
                mensagem_status,
                (20, 140),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            if contagens:
                cv2.putText(
                    preview,
                    f"Amostras: {len(contagens)}/{QUANTIDADE_AMOSTRAS}",
                    (20, 175),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA,
                )

            cv2.putText(
                preview,
                "Pressione Q para fechar",
                (20, preview.shape[0] - 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )

            cv2.imshow(NOME_JANELA, preview)

            tecla = cv2.waitKey(1) & 0xFF

            if tecla == ord("q"):
                logger.info(
                    "Encerramento solicitado pelo usuário."
                )
                break

    finally:

        camera.release()
        cv2.destroyAllWindows()

        logger.info("Câmera encerrada.")


if __name__ == "__main__":
    main()
