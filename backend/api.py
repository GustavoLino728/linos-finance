from main import inserir_lancamento
from main import cadastrar_usuario
from supabaseClient import supabase
from flask import request, jsonify, Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://organizacao-financeira-app-frontend.onrender.com"}})


@app.route('/add-lancamento', methods=['POST'])
def add_lancamento():
    dados = request.get_json()
    email = dados['email']
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
def cadastrarPlanilha():
    dados = request.get_json()
    email = dados.get("email")
    name = dados.get("name")
    sheet_url = dados.get("sheet_url")

    if not email or not sheet_url:
        return jsonify({"erro": "Email e link da planilha são obrigatórios"}), 400

    resposta = cadastrar_usuario(email, name, sheet_url)
    return jsonify({"mensagem": "Usuário cadastrado", "resposta": resposta.data}), 201

@app.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = dados.get("email")

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

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)