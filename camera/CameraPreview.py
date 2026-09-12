"""Interactive preview uses the exact same detector and API as production."""
import time
import logging
from statistics import median
from config import *
from detector import contar_pessoas, obter_modelo
from api import enviar_medicao, CredencialInvalida
from main import configurar_logs

def main():
    import cv2
    configuracao_api()
    obter_modelo()
    configurar_logs()
    camera = cv2.VideoCapture(CAMERA_INDEX)
    try:
        if not camera.isOpened():
            raise RuntimeError("Não foi possível abrir a webcam.")
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, LARGURA_CAMERA)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, ALTURA_CAMERA)
        contagens = []
        ciclo = time.monotonic() - INTERVALO_MEDICAO
        amostra = 0.0
        status = "Aguardando medicao"
        while True:
            ok, frame = camera.read()
            if not ok:
                raise RuntimeError("Não foi possível capturar imagem.")
            now = time.monotonic()
            if now - ciclo >= INTERVALO_MEDICAO and now - amostra >= INTERVALO_AMOSTRAS:
                contagens.append(contar_pessoas(frame))
                amostra = now
                status = f"Amostras: {len(contagens)}/{QUANTIDADE_AMOSTRAS}"
                if len(contagens) >= QUANTIDADE_AMOSTRAS:
                    try:
                        enviar_medicao(int(median(contagens)))
                        status = "Medicao aceita"
                    except CredencialInvalida:
                        logging.error("Dispositivo não autorizado; execução interrompida.")
                        return
                    except Exception:
                        status = "Falha no envio; aguardando novo ciclo"
                        logging.error("Não foi possível enviar a medição.")
                    contagens.clear()
                    ciclo = time.monotonic()
            cv2.putText(frame, status, (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.imshow("HospEasy - Q para sair", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        camera.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
