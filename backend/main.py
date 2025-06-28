import json
import os
import gspread
from datetime import datetime
from supabaseClient import supabase
from dateutil.relativedelta import relativedelta
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

credentials_json = os.getenv("GOOGLE_CREDENTIALS")
credentials_dict = json.loads(credentials_json)
credentials_dict = json.loads(credentials_json)
credentials_dict["private_key"] = credentials_dict["private_key"].replace("\\n", "\n")
credentials = Credentials.from_service_account_info(credentials_dict, scopes=SCOPES)

def obter_planilha(email):
    # Buscar no Supabase
    resposta = supabase.table("users").select("sheet_url").eq("email", email).single().execute()
    if resposta.data is None:
        raise Exception("Usuário não encontrado")
    url = resposta.data["sheet_url"]

    if "/d/" in url:
        planilha_id = url.split("/d/")[1].split("/")[0]
    else:
        raise Exception("Link da planilha inválido")

    # Autorizar e abrir a aba Lançamentos
    gc = gspread.authorize(credentials)
    worksheet = gc.open_by_key(planilha_id).worksheet("Lançamentos")
    return worksheet

def inserir_lancamento(email, data, tipo, desc, valor, categoria="", metodoPag="", parcelado=False, parcelas=1):
    worksheet = obter_planilha(email)
    tipo = tipo.lower()

    if tipo == 'entrada':
        lista_lancamento = [data, tipo, desc, valor]
        worksheet.append_row(lista_lancamento)

    elif tipo == 'saida':
        if parcelado:
            valor_parcela = round(float(valor) / int(parcelas), 2)
            data_base = datetime.strptime(data, "%Y-%m-%d")

            for i in range(int(parcelas)):
                data_parcela = (data_base + relativedelta(months=i)).strftime("%Y-%m-%d")
                linha = [data_parcela, tipo, f"{desc} ({i+1}/{parcelas})", valor_parcela, categoria, metodoPag]
                worksheet.append_row(linha)
    else:
        lista_lancamento = [data, tipo, desc, valor, categoria, metodoPag]
        worksheet.append_row(lista_lancamento)
    
def cadastrar_usuario(email, name, sheet_url):
    response = supabase.table("users").insert({
        "email" : email,
        "name" : name,
        "sheet_url" : sheet_url
    }).execute()
    return response



