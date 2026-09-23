"""Teste local de detecção, sem credenciais ou envio à API."""
import argparse
import time
from statistics import median
from config import validar_detector
from detector import contar_pessoas, obter_modelo
from main import coletar_contagens


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--imagem', help='Testar uma foto em vez da webcam')
    parser.add_argument('--mostrar', action='store_true', help='Abrir janela (requer OpenCV com GUI)')
    parser.add_argument('--salvar', help='Salvar última imagem com as detecções neste caminho')
    args = parser.parse_args()
    import cv2
    validar_detector()
    obter_modelo()
    desenhar = args.mostrar or bool(args.salvar)

    def exibir(quantidade, imagem, segundos):
        print(f'Pessoas: {quantidade} | inferência: {segundos:.2f}s', flush=True)
        if args.salvar and not cv2.imwrite(args.salvar, imagem):
            raise RuntimeError('Não foi possível salvar a imagem de teste.')
        if args.mostrar:
            cv2.imshow('HospEasy - teste local', imagem)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                raise KeyboardInterrupt

    try:
        if args.imagem:
            frame = cv2.imread(args.imagem)
            if frame is None:
                raise ValueError('Não foi possível ler a imagem de teste.')
            inicio = time.perf_counter()
            resultado = contar_pessoas(frame, mostrar=desenhar)
            quantidade, imagem = resultado if desenhar else (resultado, frame)
            exibir(quantidade, imagem, time.perf_counter() - inicio)
        else:
            contagens = coletar_contagens(mostrar=desenhar, ao_detectar=exibir)
            print(f'Amostras: {contagens} | mediana: {int(median(contagens))}')
        if args.mostrar:
            print('Pressione uma tecla na janela para encerrar.')
            cv2.waitKey(0)
    finally:
        if args.mostrar:
            cv2.destroyAllWindows()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        pass
