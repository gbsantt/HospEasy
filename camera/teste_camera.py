"""Local visual test; does not send measurements or require API credentials."""
from config import CAMERA_INDEX, LARGURA_CAMERA, ALTURA_CAMERA, validar_detector
from detector import contar_pessoas

def main():
    import cv2
    validar_detector()
    camera = cv2.VideoCapture(CAMERA_INDEX)
    try:
        if not camera.isOpened():
            raise RuntimeError("Não foi possível abrir a webcam.")
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, LARGURA_CAMERA)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, ALTURA_CAMERA)
        while True:
            ok, frame = camera.read()
            if not ok:
                raise RuntimeError("Não foi possível capturar imagem.")
            quantidade, imagem = contar_pessoas(frame, mostrar=True)
            cv2.putText(imagem, f"Pessoas: {quantidade}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow("HospEasy - teste local - Q para sair", imagem)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        camera.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
