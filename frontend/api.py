from main import inserir_lancamento, cadastrar_usuario, salvar_favorito
from supabaseClient import supabase, autenticar_usuario
from flask import request, jsonify, Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://organizacao-financeira-app.vercel.app", "http://localhost:3000"],
     methods=['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH'], # Adicionado DELETE e PATCH
     allow_headers=['Content-Type', 'Authorization'])

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API funcionando", "status": "ok"}), 200

@app.route('/add-lancamento', methods=['POST'])
def add_lancamento():
    try:
        email = autenticar_usuario() # Esta função deve levantar uma exceção se a autenticação falhar
        if not email:
            return jsonify({"erro": "Não autorizado: Token inválido ou ausente."}), 401

        dados = request.get_json()
        data = dados.get('data')
        tipo = dados.get('tipo')
        desc = dados.get('desc')
        valor = dados.get('valor')
        categoria = dados.get('categoria', "")
        metodoPag = dados.get('metodoPag', "")
        parcelado = dados.get('parcelado', False)
        parcelas = dados.get('parcelas', 1)

        # Validação básica para campos obrigatórios
        if not all([data, tipo, desc, valor is not None]):
            return jsonify({"erro": "Dados incompletos para o lançamento."}), 400

        inserir_lancamento(email, data, tipo, desc, valor, categoria, metodoPag, parcelado, parcelas)
        return jsonify({"mensagem": "Lançamento adicionado com sucesso"}), 201
    except Exception as e:
        print(f"Erro ao adicionar lançamento: {e}") # Loga o erro real para depuração
        return jsonify({"erro": str(e) or "Erro interno ao adicionar lançamento."}), 500

@app.route('/cadastrar', methods=['POST'])
def cadastrar_planilha():
    dados = request.get_json()
    email = dados.get('email')
    name = dados.get('name')
    sheet_url = dados.get('sheet_url')
    
    if not email or not sheet_url:
        return jsonify({"erro": "Email e link da planilha são obrigatórios"}), 400
    
    # Verifica se usuário já existe
    existing = supabase.table("users").select("email").eq("email", email).execute()
    if len(existing.data) > 0: # Verificação explícita do tamanho da lista
        return jsonify({"erro": "Usuário já cadastrado"}), 400
    
    resposta = cadastrar_usuario(email, name, sheet_url)
    return jsonify({"mensagem": "Usuário cadastrado", "resposta": resposta.data}), 201

@app.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = dados.get('email') # Usar .get() para evitar KeyError se o campo não existir
    
    if not email:
        return jsonify({"erro": "Email é obrigatório"}), 400
    
    response = supabase.table("users").select("id, email, name, sheet_url").eq("email", email).execute()
    
    if len(response.data) > 0: # Verificação explícita do tamanho da lista
        usuario = response.data[0]
        return jsonify({
            "id": usuario["id"],
            "email": usuario["email"],
            "name": usuario.get("name", "Usuário"), # Garante que o nome seja retornado, com fallback
            "sheet_url": usuario["sheet_url"]
        }), 200
    else:
        return jsonify({"erro": "Usuário não encontrado"}), 404

@app.route('/favoritos', methods=['POST'])
def salvar_favorito_route(): # Renomeado para evitar conflito com a função importada
    try:
        email = autenticar_usuario()
        if not email:
            return jsonify({"erro": "Não autorizado: Token inválido ou ausente."}), 401

        dados = request.get_json()
        tipo = dados.get('tipo')
        desc = dados.get('desc')
        valor = dados.get('valor')
        categoria = dados.get('categoria', "")
        metodoPag = dados.get('metodoPag', "")

        if not all([tipo, desc, valor is not None]):
            return jsonify({"erro": "Dados incompletos para o favorito."}), 400

        resposta = salvar_favorito(email, tipo, desc, valor, categoria, metodoPag)
        return jsonify({"mensagem" : "Salvo com sucesso!", "resposta": resposta.data}), 201
    except Exception as e:
        print(f"Erro ao salvar favorito: {e}")
        return jsonify({"erro": str(e) or "Erro interno ao salvar favorito."}), 500

@app.route('/favoritos', methods=['GET'])
def mostrar_favorito():
    try:
        email = autenticar_usuario()
        if not email:
            return jsonify({"erro": "Não autorizado: Token inválido ou ausente."}), 401
        
        # Incluindo 'id' na seleção para o frontend
        resposta = (supabase.table("favorites").select("id, type, description, value, category, payment_method").eq("user_email", email).execute() )
        return jsonify({"mensagem" : "Listando Favoritos do Usuario", "resposta" : resposta.data}),200
    except Exception as e:
        print(f"Erro ao mostrar favoritos: {e}")
        return jsonify({"erro": str(e) or "Erro interno ao listar favoritos."}), 500

@app.route('/favoritos/<id>', methods=['DELETE'])
def deletar_favorito(id):
    try:
        email = autenticar_usuario()
        if not email:
            return jsonify({"erro": "Não autorizado: Token inválido ou ausente."}), 401

        consulta = supabase.table('favorites').select("id").eq("user_email", email).eq("id", id).execute()
        if len(consulta.data) > 0:
            supabase.table('favorites').delete().eq("id", id).eq("user_email", email).execute()
            return jsonify({"mensagem" : "Favorito deletado com sucesso"}), 200 # Retorno 200 explícito
        else:
            return jsonify({"erro": "Favorito não encontrado ou não pertence ao usuário"}), 404
    except Exception as e:
        print(f"Erro ao deletar favorito: {e}")
        return jsonify({"erro": str(e) or "Erro interno ao deletar favorito."}), 500

@app.route('/favoritos/<id>', methods=['PATCH'])
def editar_favorito(id):
    try:
        email = autenticar_usuario()
        if not email:
            return jsonify({"erro": "Não autorizado: Token inválido ou ausente."}), 401

        consulta = supabase.table('favorites').select("id").eq("id", id).eq("user_email", email).execute()
        if len(consulta.data) > 0:
            dados = request.get_json()
            desc = dados.get('desc')
            tipo = dados.get('tipo')
            valor = dados.get('valor')
            categoria = dados.get('categoria', "")
            metodoPag = dados.get('metodoPag', "")

            if not all([desc, tipo, valor is not None]):
                return jsonify({"erro": "Dados incompletos para a edição do favorito."}), 400

            newFavorito = supabase.table('favorites').update({"description": desc, "type":tipo, "value":valor, "category":categoria, "payment_method":metodoPag}).eq('user_email', email).eq('id', id).execute()
            return jsonify({"mensagem": "Favorito editado com sucesso!", "resposta" : newFavorito.data }), 200 # Retornar .data
        else:
            return jsonify({"erro": "Favorito não encontrado ou não pertence ao usuário"}), 404
    except Exception as e:
        print(f"Erro ao editar favorito: {e}")
        return jsonify({"erro": str(e) or "Erro interno ao editar favorito."}), 500

@app.route('/check-user', methods=['POST'])
def check_user():
    dados = request.get_json()
    email = dados.get('email')
    
    if not email:
        return jsonify({"erro": "Email é obrigatório"}), 400
    
    response = supabase.table("users").select("email").eq("email", email).execute()
    
    # AQUI ESTÁ A MUDANÇA CRÍTICA:
    # `response.data` é uma lista. Se nenhum usuário for encontrado, será uma lista vazia `[]`.
    # Em Python, uma lista vazia é avaliada como `False` em um contexto booleano.
    # No entanto, para maior clareza e para evitar qualquer ambiguidade, vamos usar `len()`.
    if len(response.data) > 0: # Se o comprimento da lista de dados for maior que 0, o usuário existe.
        return jsonify({"mensagem": "Usuário encontrado"}), 200
    else: # Caso contrário, o usuário não foi encontrado.
        return jsonify({"erro": "Usuário não encontrado"}), 404

@app.after_request
def after_request(response):
    # Garante que os cabeçalhos CORS sejam definidos corretamente para todas as respostas
    response.headers.add("Access-Control-Allow-Origin", request.headers.get('Origin') or "*") # Reflete a origem da requisição
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE,PATCH") # Inclui todos os métodos usados
    response.headers.add("Access-Control-Allow-Credentials", "true") # Necessário para alguns fluxos de autenticação
    return response

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
