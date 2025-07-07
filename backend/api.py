from main import inserir_lancamento, cadastrar_usuario, salvar_favorito
from supabaseClient import supabase, autenticar_usuario
from flask import request, jsonify, Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://organizacao-financeira-app.vercel.app", "http://localhost:3000"],
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API funcionando", "status": "ok"}), 200

@app.route('/add-lancamento', methods=['POST'])
def add_lancamento():
    dados = request.get_json()
    email = autenticar_usuario()
    data = dados['data']
    tipo = dados['tipo']
    desc = dados['desc']
    valor = dados['valor']
    categoria = dados.get('categoria', "")
    metodoPag = dados.get('metodoPag', "")
    parcelado = dados.get('parcelado', False)
    parcelas = dados.get('parcelas', 1)

    inserir_lancamento(email, data, tipo, desc, valor, categoria, metodoPag, parcelado, parcelas)
    return jsonify({"mensagem": "Lançamento adicionado com sucesso"}), 201

@app.route('/cadastrar', methods=['POST'])
def cadastrar_planilha():
    dados = request.get_json()
    email = autenticar_usuario()
    name = dados['name']
    sheet_url = dados['sheet_url']

    if not email or not sheet_url:
        return jsonify({"erro": "Email e link da planilha são obrigatórios"}), 400

    resposta = cadastrar_usuario(email, name, sheet_url)
    return jsonify({"mensagem": "Usuário cadastrado", "resposta": resposta.data}), 201

@app.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = autenticar_usuario()

    response = supabase.table("users").select("id, email, name, sheet_url").eq("email", email).execute()
    if response.data:
        usuario = response.data[0]
        return jsonify({
            "id": usuario["id"],
            "email": usuario["email"],
            "sheet_url": usuario["sheet_url"]
        }), 200
    else:
        return jsonify({"erro": "Usuário não encontrado"}), 404
    
@app.route('/favoritos', methods=['POST'])
def salvar_favorito():
    dados = request.get_json()
    email = autenticar_usuario()
    tipo = dados['tipo']
    desc = dados['desc']
    valor = dados['valor']
    categoria = dados.get('categoria', "")
    metodoPag = dados.get('metodoPag', "")

    resposta = salvar_favorito(email, tipo, desc, valor, categoria, metodoPag)
    return jsonify({"mensagem" : "Salvo com sucesso!", "resposta": resposta.data}), 201

@app.route('/favoritos', methods=['GET'])
def mostrar_favorito():
    email = autenticar_usuario()
    resposta = (supabase.table("favorites").select("type, description, value, category, payment_method").eq("user_email", email).execute() )
    return jsonify({"mensagem" : "Listando Favoritos do Usuario", "resposta" : resposta.data}),200

@app.route('/favoritos/<id>', methods=['DELETE'])
def deletar_favorito(id):
    email = autenticar_usuario()
    consulta = supabase.table('favorites').select("id").eq("user_email", email).eq("id", id).execute()
    if consulta.data:
        supabase.table('favorites').delete().eq("id", id).eq("user_email", email).execute()
    else:
        return jsonify({"erro": "Favorito não encontrado ou não pertence ao usuário"}), 404
    return jsonify({"mensagem" : "Favorito deletado com sucesso"})

@app.route('/favoritos/<id>', methods=['PATCH'])
def editar_favorito(id):
    email = autenticar_usuario()
    consulta = supabase.table('favorites').select("id").eq("id", id).eq("user_email", email).execute()
    if consulta.data:
        dados = request.get_json()
        desc = dados['desc']
        tipo = dados['tipo']
        valor = dados['valor']
        categoria = dados.get('categoria', "")
        metodoPag = dados.get('metodoPag', "")

        newFavorito = supabase.table('favorites').update({"description": desc, "type":tipo, "value":valor, "category":categoria, "payment_method":metodoPag}).eq('user_email', email).eq('id', id).execute()
        return jsonify({"mensagem": "Favorito editado com sucesso!", "resposta" : newFavorito }), 200
    else:
        return jsonify({"mensagem": "Favorito não encontrado ou não pertence ao usuário"}), 404

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)