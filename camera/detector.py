from ultralytics import YOLO
from config import CONFIANCA_MINIMA

modelo = YOLO("yolov8n.pt")


def contar_pessoas(imagem, mostrar=False):
    resultados = modelo(
        imagem,
        conf=CONFIANCA_MINIMA
    )

    quantidade_pessoas = 0

    for resultado in resultados:
        for caixa in resultado.boxes:
            classe_id = int(caixa.cls[0])
            confianca = float(caixa.conf[0])

            if classe_id == 0 and confianca >= 0.50:
                quantidade_pessoas += 1

        if mostrar:
            imagem_anotada = resultado.plot()

            return quantidade_pessoas, imagem_anotada

    return quantidade_pessoas