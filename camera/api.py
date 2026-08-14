import os
import requests

from dotenv import load_dotenv
from requests.exceptions import (
    ConnectionError,
    Timeout,
    HTTPError
)

load_dotenv()

URL_BACKEND = os.getenv("URL_BACKEND")
UNIDADE_ID = os.getenv("UNIDADE_ID")
CHAVE_API = os.getenv("CHAVE_API")


def enviar_medicao(quantidade_pessoas):
    url = f"{URL_BACKEND}/unidades/{UNIDADE_ID}/medicoes"

    headers = {
        "X-API-Key": CHAVE_API
    }

    dados = {
        "quantidadePessoas": quantidade_pessoas
    }

    try:
        resposta = requests.post(
            url,
            json=dados,
            headers=headers,
            timeout=10
        )

        resposta.raise_for_status()

        return resposta.json()

    except Timeout:
        raise RuntimeError(
            "Tempo limite excedido ao conectar com o backend."
        )

    except ConnectionError:
        raise RuntimeError(
            "Não foi possível conectar ao backend."
        )

    except HTTPError as erro:
        status = erro.response.status_code

        raise RuntimeError(
            f"Backend retornou erro HTTP: {status}"
        )


if __name__ == "__main__":
    try:
        resposta = enviar_medicao(5)

        print("Medição enviada com sucesso!")
        print(resposta)

    except Exception as erro:
        print("Erro ao enviar medição:")
        print(erro)