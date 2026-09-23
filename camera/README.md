# Câmera no Raspberry Pi 4

Execução leve com YOLOv8n COCO em ONNX + OpenCV, sem Torch/Ultralytics no Pi.
O modelo `yolov8n.onnx` já está preparado. O `.pt` e `exportar_modelo.py` são
necessários somente no computador para gerar novamente o modelo.

## Instalar no Raspberry Pi OS 64 bits

Use um ambiente novo para não carregar a instalação antiga do Torch:

```sh
cd camera
python3 -m venv .venv-pi
source .venv-pi/bin/activate
python -m pip install --no-cache-dir -r requirements.txt
python teste_camera.py
```

O teste abre uma webcam USB/V4L2, coleta cinco amostras, imprime as contagens,
o tempo de cada inferência e a mediana, e encerra. Não exige chave nem servidor.
Câmeras CSI/libcamera não são implementadas por este cliente.
Para conferir visualmente sem instalar interface gráfica:

```sh
python teste_camera.py --salvar deteccao.jpg
python teste_camera.py --imagem foto.jpg --salvar deteccao.jpg
```

Confira o arquivo gerado e compare com o número real de pessoas. A imagem salva
é a última amostra; a mediana usa as cinco. Fotos não simulam a estabilidade temporal.
Em um computador com monitor, `--mostrar` abre uma janela. Para isso substitua
`opencv-python-headless` por `opencv-python` da mesma versão (não instale ambos).

Se ainda aparecer falta de espaço, confira `df -h` e `df -h /tmp`; `free -h`
mostra a RAM. A instalação usa `--no-cache-dir` para evitar guardar os downloads.
Não é necessário instalar Torch, Ultralytics ou ONNX no Raspberry.

## Serviço

Copie `.env.example` para `.env` e preencha a URL e chave do dispositivo.
Se seu `.env` antigo definir `HOSPEASY_MODEL_PATH` com `.pt`, remova essa linha
ou altere para `yolov8n.onnx`.

```sh
python main.py
```

Mantidos: confiança 0.5, classe pessoa, NMS IoU 0.7, mediana de cinco amostras,
captura 1280x720, intervalo de 180 segundos após cada ciclo, autenticação,
timeout, tentativas com UUID idempotente e logs rotativos. Falhas de captura
ou inferência não são enviadas como zero pessoas. A câmera é liberada entre ciclos.
O teste e o serviço compartilham a coleta e o detector. São descartados frames
pendentes entre amostras para reduzir o risco de medir imagens antigas.

Entrada fixa do modelo: 640x384, FP32, com proporção preservada e preenchimento
114. Corresponde à entrada anterior para a câmera padrão 16:9. Outros formatos
de câmera/foto podem produzir diferenças em relação ao redimensionamento
adaptativo antigo. OpenCV usa duas threads e só desenha caixas no teste quando
solicitado. Não há quantização, redução do limiar ou troca por detector mais fraco.
A conversão não garante contagens idênticas perto do limiar: valide na instalação
real, incluindo oclusões, pessoas distantes, sala vazia e iluminação variável.
Desempenho no Pi deve ser medido no próprio aparelho.

## Gerar novamente o modelo (somente no PC)

Use o `yolov8n.pt` original, de origem confiável, na pasta camera:

```sh
python -m pip install ultralytics==8.4.118 "onnx>=1.16,<2"
python exportar_modelo.py
```

Copie o `.onnx` resultante para a mesma pasta no Pi. A exportação é FP32, batch 1,
opset 12, sem NMS embutida e sem dimensões dinâmicas. O detector rejeita saídas
com formato diferente de YOLOv8 COCO 640x384. O serviço não baixa modelos.
Mantenha os termos de licença aplicáveis ao modelo original.

## Testes automatizados

```sh
python -m unittest discover -s camera -p 'test_*.py' -v
```

Execute esse comando na raiz do repositório. Os testes cobrem o pós-processamento,
a coleta e as garantias do cliente HTTP; não certificam a precisão no hospital.

Referências: [YOLO no OpenCV](https://docs.opencv.org/4.13.0/da/d9d/tutorial_dnn_yolo.html)
e [exportação Ultralytics](https://docs.ultralytics.com/modes/export/).
