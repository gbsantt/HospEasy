"""YOLOv8n COCO FP32 via OpenCV DNN; no PyTorch at runtime."""
import numpy as np
from config import CONFIANCA_MINIMA, MODELO_PATH, validar_detector

# Same stride-32 input used by YOLO for the default 1280x720 camera.
LARGURA_MODELO, ALTURA_MODELO = 640, 384
_modelo = None


def obter_modelo():
    global _modelo
    validar_detector()
    if _modelo is None:
        if not MODELO_PATH.is_file():
            raise RuntimeError("Modelo ausente. Copie yolov8n.onnx para camera; veja camera/README.md.")
        if MODELO_PATH.suffix.lower() != ".onnx":
            raise ValueError("Use o modelo ONNX exportado por exportar_modelo.py, não o arquivo .pt.")
        import cv2
        cv2.setNumThreads(2)
        modelo = cv2.dnn.readNetFromONNX(str(MODELO_PATH))
        modelo.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        modelo.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        _modelo = modelo
    return _modelo


def preparar_imagem(imagem):
    import cv2
    if imagem is None or imagem.ndim != 3 or imagem.shape[2] != 3 or not imagem.size:
        raise ValueError("Imagem BGR vazia ou inválida.")
    altura, largura = imagem.shape[:2]
    escala = min(LARGURA_MODELO / largura, ALTURA_MODELO / altura)
    w, h = round(largura * escala), round(altura * escala)
    esquerda = round((LARGURA_MODELO - w) / 2 - 0.1)
    topo = round((ALTURA_MODELO - h) / 2 - 0.1)
    redimensionada = cv2.resize(imagem, (w, h), interpolation=cv2.INTER_LINEAR)
    preenchida = cv2.copyMakeBorder(redimensionada, topo, ALTURA_MODELO - h - topo,
                                   esquerda, LARGURA_MODELO - w - esquerda,
                                   cv2.BORDER_CONSTANT, value=(114, 114, 114))
    blob = cv2.dnn.blobFromImage(preenchida, 1 / 255.0, swapRB=True, crop=False)
    return blob, escala, esquerda, topo


def selecionar_pessoas(saida):
    import cv2
    if saida.shape != (1, 84, 5040) or not np.isfinite(saida).all():
        raise RuntimeError("Saída incompatível: exporte YOLOv8n COCO com exportar_modelo.py.")
    candidatos = saida[0].T
    classes = candidatos[:, 4:]
    # Match single-label selection BEFORE filtering class 0.
    mascara = (classes.argmax(axis=1) == 0) & (classes[:, 0] > CONFIANCA_MINIMA)
    pessoas = candidatos[mascara]
    caixas = pessoas[:, :4].copy()
    caixas[:, :2] -= caixas[:, 2:] / 2
    scores = pessoas[:, 4]
    indices = cv2.dnn.NMSBoxes(caixas.tolist(), scores.tolist(), CONFIANCA_MINIMA, 0.7)
    indices = np.asarray(indices, dtype=int).reshape(-1)[:300]
    return caixas[indices], scores[indices]


def contar_pessoas(imagem, mostrar=False):
    import cv2
    modelo = obter_modelo()
    blob, escala, esquerda, topo = preparar_imagem(imagem)
    modelo.setInput(blob)
    caixas, scores = selecionar_pessoas(modelo.forward())
    quantidade = len(caixas)
    if not mostrar:
        return quantidade
    anotada = imagem.copy()
    altura, largura = imagem.shape[:2]
    for (x, y, w, h), score in zip(caixas, scores):
        x1 = int(np.clip((x - esquerda) / escala, 0, largura - 1))
        y1 = int(np.clip((y - topo) / escala, 0, altura - 1))
        x2 = int(np.clip((x + w - esquerda) / escala, 0, largura - 1))
        y2 = int(np.clip((y + h - topo) / escala, 0, altura - 1))
        cv2.rectangle(anotada, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(anotada, f"Pessoa {score:.2f}", (x1, max(15, y1 - 5)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    return quantidade, anotada
