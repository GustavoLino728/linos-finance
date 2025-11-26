import json
import os
import gspread
from datetime import datetime
from supabaseClient import supabase, supabase_admin
from dateutil.relativedelta import relativedelta
from google.oauth2.service_account import Credentials
from datetime import datetime

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

def get_user_sheets(auth_id, worksheet="Lançamentos"):
    response = supabase_admin.table("user_profiles").select("sheet_url").eq("auth_id", auth_id).single().execute()
    if response.data is None:
        raise Exception("Usuário não encontrado")
    url = response.data["sheet_url"]

    if "/d/" in url:
        planilha_id = url.split("/d/")[1].split("/")[0]
    else:
        raise Exception("Link da planilha inválido")

    gc = gspread.authorize(credentials)
    worksheet = gc.open_by_key(planilha_id).worksheet(worksheet)
    return worksheet

def create_transaction(auth_id, data, transaction_type, description, value, category="", payment_method="", parcelado=False, parcelas=1):
    worksheet = get_user_sheets(auth_id)
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

def save_favorites(auth_id, transaction_type, description, value, category="", payment_method=""):
    transaction_type = transaction_type.lower()
    data = {
        "auth_id": auth_id,
        "type": transaction_type,
        "description": description,
        "value": value
    }
    if transaction_type != 'entrada':
        data.update({
            "category": category,
            "payment_method": payment_method
        })
    favorito = supabase_admin.table("favorites").insert(data).execute()
    return favorito

def get_last_transactions(auth_id, worksheet_name="Resumo Mensal", 
                          start_col='D', end_col='I', header_row=2, max_records=10):
    worksheet = get_user_sheets(auth_id, worksheet=worksheet_name)
    
    col_index_to_check = 5 
    col_values = worksheet.col_values(col_index_to_check)
    
    total_rows = len(col_values)
    
    if total_rows <= header_row:
        return [] 
    
    start_row = header_row + 1
    end_row = total_rows
    
    cell_range = f"{start_col}{start_row}:{end_col}{end_row}"
    
    data = worksheet.get(cell_range)
    
    last_rows = data[-max_records:] if len(data) > max_records else data
    
    
    headers = ["data", "tipo", "descricao", "valor", "categoria", "metodoPagamento"]
    
    transactions = []
    for row in last_rows:
        padded_row = row + [None] * (6 - len(row)) if len(row) < 6 else row[:6]
        
        transaction = dict(zip(headers, padded_row))
        
        if not transaction.get("valor"):
            transaction["valor"] = "0.00"
        
        transactions.append(transaction)
    
    return transactions

def create_goal_supabase(auth_id, name, goal_value, current_value):
    data = {
        "auth_id": auth_id,
        "name": name,
        "goal_value": goal_value,
        "current_value": current_value
    }
    new_goal = supabase_admin.table("goals").insert(data).execute()
    return new_goal

def get_balance(auth_id):
    worksheet = get_user_sheets(auth_id, worksheet="Resumo Mensal")
    balance = worksheet.acell('B9').value
    return balance

def get_spend_goal_progress(auth_id):
    user = supabase.table("user_profiles").select("spend_goal").eq("auth_id", auth_id).single().execute()
    if not user.data or not user.data.get("spend_goal"):
        return {"error": "Meta mensal não definida"}

    meta = user.data["spend_goal"]

    hoje = datetime.utcnow()
    mes_ano = hoje.strftime("%Y-%m")

    gastos_result = supabase.table("transactions")\
        .select("value")\
        .eq("auth_id", auth_id)\
        .eq("transaction_type", "saida")\
        .like("data", f"{mes_ano}%")\
        .execute()

    total_gasto = sum(tx["value"] for tx in gastos_result.data) if gastos_result.data else 0

    saldo_restante = meta - total_gasto
    if saldo_restante < 0:
        saldo_restante = 0

    return {
        "meta_mensal": meta,
        "total_gastos": total_gasto,
        "saldo_restante": saldo_restante
    }
