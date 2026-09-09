import cv2

from detector import modelo
from config import (
    CAMERA_INDEX,
    LARGURA_CAMERA,
    ALTURA_CAMERA,
    CONFIANCA_MINIMA
)


def main():
    camera = cv2.VideoCapture(CAMERA_INDEX)

    camera.set(
        cv2.CAP_PROP_FRAME_WIDTH,
        LARGURA_CAMERA
    )

    camera.set(
        cv2.CAP_PROP_FRAME_HEIGHT,
        ALTURA_CAMERA
    )
    if not camera.isOpened():
        raise RuntimeError(
            "Não foi possível abrir a webcam."
        )

    print("Modo de teste iniciado.")
    print("Pressione Q para sair.")

    cv2.namedWindow(
        "HospEasy - Teste da Camera",
        cv2.WINDOW_NORMAL
    )

    cv2.resizeWindow(
        "HospEasy - Teste da Camera",
        960,
        540
    )

    while True:
        sucesso, frame = camera.read()

        if not sucesso:
            print("Erro ao capturar frame.")
            break

        resultados = modelo(
            frame,
            conf=CONFIANCA_MINIMA,
            verbose=False
        )

        quantidade_pessoas = 0
        imagem_anotada = frame.copy()

        for resultado in resultados:
            for caixa in resultado.boxes:
                classe_id = int(caixa.cls[0])
                confianca = float(caixa.conf[0])

                # Classe 0 = person
                if classe_id != 0:
                    continue

                quantidade_pessoas += 1

                x1, y1, x2, y2 = map(
                    int,
                    caixa.xyxy[0]
                )

                cv2.rectangle(
                    imagem_anotada,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )

                texto = f"Pessoa {confianca:.2f}"

                cv2.putText(
                    imagem_anotada,
                    texto,
                    (x1, max(y1 - 10, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

        cv2.putText(
            imagem_anotada,
            f"Pessoas: {quantidade_pessoas}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.imshow(
            "HospEasy - Teste da Camera",
            imagem_anotada
        )

        tecla = cv2.waitKey(1) & 0xFF

        if tecla == ord("q"):
            break

    camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    try:
        main()

    except Exception as erro:
        print("Erro:")
        print(erro)