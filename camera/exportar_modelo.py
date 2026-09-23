"""Run once on a PC, never needed on the Raspberry Pi."""
import os
from pathlib import Path


def main():
    os.environ["YOLO_AUTOINSTALL"] = "false"
    from ultralytics import YOLO
    origem = Path(__file__).resolve().parent / "yolov8n.pt"
    if not origem.is_file():
        raise FileNotFoundError(f"Modelo original ausente: {origem}")
    modelo = YOLO(str(origem))
    if modelo.task != "detect" or len(modelo.names) != 80 or modelo.names[0] != "person":
        raise ValueError("É necessário o YOLOv8n de detecção COCO (80 classes).")
    destino = modelo.export(format="onnx", imgsz=[384, 640], opset=12,
                            dynamic=False, simplify=False, half=False, nms=False,
                            batch=1, device="cpu")
    print(f"Copie para o Raspberry: {destino}")


if __name__ == "__main__":
    main()
