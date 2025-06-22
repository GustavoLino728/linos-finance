import json
import os
import gspread
from google.oauth2.service_account import Credentials

credentials_json = os.getenv("GOOGLE_CREDENTIALS")
credentials_dict = json.loads(credentials_json)
credentials_dict["private_key"] = credentials_dict["private_key"].replace("\\n", "\n")
credentials = Credentials.from_service_account_info(credentials_dict)

gc = gspread.authorize(credentials)

lancamentos = gc.open("App-Finanças").worksheet("Lançamentos")

def inserirLancamento(data, tipo, desc, valor, categoria="", metodoPag=""):
    tipo = tipo.lower()
    if tipo == 'entrada':
        lista_lancamento = [data, tipo, desc, valor]
    elif tipo == 'saida':
        lista_lancamento = [data, tipo, desc, valor, categoria, metodoPag]

    lancamentos.append_row(lista_lancamento)
    




