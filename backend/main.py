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
if isinstance(credentials_json, str):
    try:
        credentials_dict = json.loads(credentials_json)
        if isinstance(credentials_dict, str):
            credentials_dict = json.loads(credentials_dict)
    except Exception as e:
        raise ValueError(f"Erro ao carregar GOOGLE_CREDENTIALS: {e}")
else:
    raise TypeError("GOOGLE_CREDENTIALS precisa ser uma string JSON")

credentials_dict["private_key"] = credentials_dict["private_key"].replace("\\n", "\n")
credentials = Credentials.from_service_account_info(credentials_dict, scopes=SCOPES)

def get_user_sheets(email):
    resposta = supabase.table("users").select("sheet_url").eq("email", email).single().execute()
    if resposta.data is None:
        raise Exception("Usuário não encontrado")
    url = resposta.data["sheet_url"]

    if "/d/" in url:
        planilha_id = url.split("/d/")[1].split("/")[0]
    else:
        raise Exception("Link da planilha inválido")

    gc = gspread.authorize(credentials)
    worksheet = gc.open_by_key(planilha_id).worksheet("Lançamentos")
    return worksheet

def create_transaction(email, data, transaction_type, description, value, category="", payment_method="", parcelado=False, parcelas=1):
    worksheet = get_user_sheets(email)
    transaction_type = transaction_type.lower()

    if transaction_type == 'entrada':
        linha = [data, transaction_type, description, value]
        worksheet.append_row(linha)

    elif transaction_type == 'saida':
        if parcelado:
            valor_parcela = round(float(value) / int(parcelas), 2)
            data_base = datetime.strptime(data, "%Y-%m-%d")

            for i in range(int(parcelas)):
                data_parcela = (data_base + relativedelta(months=i)).strftime("%Y-%m-%d")
                linha = [data_parcela, transaction_type, f"{description} ({i+1}/{parcelas})", valor_parcela, category, payment_method]
                worksheet.append_row(linha)
        else:
            linha = [data, transaction_type, description, value, category, payment_method]
            worksheet.append_row(linha)
    else:
        linha = [data, transaction_type, description, value, category, payment_method]
        worksheet.append_row(linha)

def save_favorites(email, transaction_type, description, value, category="", payment_method=""):
    transaction_type = transaction_type.lower()
    data = {
        "user_email": email,
        "type": transaction_type,
        "description": description,
        "value": value
    }
    if transaction_type != 'entrada':
        data.update({
            "category": category,
            "payment_method": payment_method
        })
    favorito = supabase.table("favorites").insert(data).execute()
    return favorito

def register_user(email, name, sheet_url):
    response = supabase.table("users").insert({
        "email": email,
        "name": name,
        "sheet_url": sheet_url
    }).execute()
    return response

def get_balance(email):
    worksheet = get_user_sheets(email)
    balance = worksheet.acell('B10').value
    return balance