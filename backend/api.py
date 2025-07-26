from main import inserir_lancamento, cadastrar_usuario, salvar_favorito as salvar_favorito_func
from supabaseClient import supabase
from flask import request, jsonify, Flask
from flask_cors import CORS

app = Flask(__name__)

origins = [
    "http://localhost:3000",
    "https://organizacao-financeira-app.vercel.app"
]

CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API funcionando", "status": "ok"}), 200

@app.route('/add-lancamento', methods=['POST'])
def add_lancamento():
    dados = request.get_json()
    email = dados['email'] 

    inserir_lancamento(email, dados['data'], dados['tipo'], dados['desc'], dados['valor'],
                      dados.get('categoria', ""), dados.get('metodoPag', ""),
                      dados.get('parcelado', False), dados.get('parcelas', 1))
    return jsonify({"mensagem": "Lançamento adicionado com sucesso"}), 201


@app.route('/cadastrar', methods=['POST'])
def cadastrar_planilha():
    dados = request.get_json()
    email = dados['email']
    name = dados['name']
    sheet_url = dados['sheet_url']

    if not email or not sheet_url:
        return jsonify({"erro": "Email e link da planilha são obrigatórios"}), 400

    existe = supabase.table("users").select("id").eq("email", email).execute()
    if existe.data:
        return jsonify({"erro": "Usuário já cadastrado"}), 409

    resposta = cadastrar_usuario(email, name, sheet_url)
    return jsonify({"mensagem": "Usuário cadastrado", "resposta": resposta.data}), 201

@app.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = dados['email']

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
def rota_salvar_favorito():
    dados = request.get_json()
    email = dados['email']
    tipo = dados['tipo']
    desc = dados['desc']
    valor = dados['valor']
    categoria = dados.get('categoria', "")
    metodoPag = dados.get('metodoPag', "")

    resposta = salvar_favorito_func(email, tipo, desc, valor, categoria, metodoPag)
    return jsonify({"mensagem" : "Salvo com sucesso!", "resposta": resposta.data}), 201

@app.route('/favoritos', methods=['GET'])
def mostrar_favorito():
    email = request.args.get('email') 
    if not email:
        return jsonify({"erro": "Parâmetro 'email' é obrigatório"}), 400
    resposta = supabase.table("favorites").select("id,type, description, value, category, payment_method").eq("user_email", email).execute()
    return jsonify({"mensagem" : "Listando Favoritos do Usuario", "resposta" : resposta.data}),200

@app.route('/favoritos/<id>', methods=['DELETE'])
def deletar_favorito(id):
    dados = request.get_json()
    email = dados['email']
    consulta = supabase.table('favorites').select("id").eq("user_email", email).eq("id", id).execute()
    if consulta.data:
        supabase.table('favorites').delete().eq("id", id).eq("user_email", email).execute()
    else:
        return jsonify({"erro": "Favorito não encontrado ou não pertence ao usuário"}), 404
    return jsonify({"mensagem" : "Favorito deletado com sucesso"})

@app.route('/favoritos/<id>', methods=['PATCH'])
def editar_favorito(id):
    dados = request.get_json()
    email = dados['email']
    consulta = supabase.table('favorites').select("id").eq("id", id).eq("user_email", email).execute()
    if consulta.data:
        dados = request.get_json()
        desc = dados['desc']
        tipo = dados['tipo']
        valor = dados['valor']
        categoria = dados.get('categoria', "")
        metodoPag = dados.get('metodoPag', "")

        newFavorito = supabase.table('favorites').update({
            "description": desc,
            "type": tipo,
            "value": valor,
            "category": categoria,
            "payment_method": metodoPag
        }).eq('user_email', email).eq('id', id).execute()
        return jsonify({"mensagem": "Favorito editado com sucesso!", "resposta" : newFavorito }), 200
    else:
        return jsonify({"mensagem": "Favorito não encontrado ou não pertence ao usuário"}), 404



if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)