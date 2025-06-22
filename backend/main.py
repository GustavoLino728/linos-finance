import gspread

gc = gspread.service_account(filename="google_credentials.json")
lancamentos = gc.open("App-Finanças").worksheet("Lançamentos")

def inserirLancamento(data, tipo, desc, valor, categoria="", metodoPag=""):
    tipo = tipo.lower()
    if tipo == 'entrada':
        lista_lancamento = [data, tipo, desc, valor]
    elif tipo == 'saida':
        lista_lancamento = [data, tipo, desc, valor, categoria, metodoPag]

    lancamentos.append_row(lista_lancamento)
    




