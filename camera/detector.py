from config import CONFIANCA_MINIMA, MODELO_PATH, validar_detector
_modelo = None

def obter_modelo():
    global _modelo
    validar_detector()
    if _modelo is None:
        if not MODELO_PATH.is_file():
            raise RuntimeError("Modelo ausente. Configure HOSPEASY_MODEL_PATH ou instale yolov8n.pt na pasta camera.")
        from ultralytics import YOLO
        _modelo = YOLO(str(MODELO_PATH))
    return _modelo

def contar_pessoas(imagem, mostrar=False):
    resultados = obter_modelo()(imagem, conf=CONFIANCA_MINIMA, classes=[0], verbose=False)
    quantidade = sum(len(r.boxes) for r in resultados)
    if mostrar:
        return quantidade, resultados[0].plot() if resultados else imagem.copy()
    return quantidade
