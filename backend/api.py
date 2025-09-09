from main import inserir_lancamento, cadastrar_usuario, buscar_saldo, salvar_favorito as salvar_favorito_func
from supabaseClient import supabase
from flask import request, jsonify, Flask
from flask_cors import CORS

app = Flask(__name__)

origins = [
    "http://localhost:3000",
    "https://organizacao-financeira-app.vercel.app"
]

CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)

@app.route('/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    email = data['email'] 

    inserir_lancamento(email, data['data'], data['tipo'], data['desc'], data['valor'],
                      data.get('categoria', ""), data.get('metodoPag', ""),
                      data.get('parcelado', False), data.get('parcelas', 1))
    return jsonify({"mensagem": "Lançamento adicionado com sucesso"}), 201


@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data['email']
    name = data['name']
    sheet_url = data['sheet_url']

    if not email or not sheet_url:
        return jsonify({"erro": "Email e link da planilha são obrigatórios"}), 400

    existe = supabase.table("users").select("id").eq("email", email).execute()
    if existe.data:
        return jsonify({"erro": "Usuário já cadastrado"}), 409

    resposta = cadastrar_usuario(email, name, sheet_url)
    return jsonify({"mensagem": "Usuário cadastrado", "resposta": resposta.data}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']

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

@app.route('/favorites', methods=['POST'])
def rota_salvar_favorito():
    data = request.get_json()
    email = data['email']
    tipo = data['tipo']
    desc = data['desc']
    valor = data['valor']
    categoria = data.get('categoria', "")
    metodoPag = data.get('metodoPag', "")

    resposta = salvar_favorito_func(email, tipo, desc, valor, categoria, metodoPag)
    return jsonify({"mensagem" : "Salvo com sucesso!", "resposta": resposta.data}), 201

@app.route('/favorites', methods=['GET'])
def mostrar_favorito():
    email = request.args.get('email') 
    if not email:
        return jsonify({"erro": "Parâmetro 'email' é obrigatório"}), 400
    resposta = supabase.table("favorites").select("id,type, description, value, category, payment_method").eq("user_email", email).execute()
    return jsonify({"mensagem" : "Listando Favoritos do Usuario", "resposta" : resposta.data}),200

@app.route('/favorites/<id>', methods=['DELETE'])
def deletar_favorito(id):
    data = request.get_json()
    email = data['email']
    consulta = supabase.table('favorites').select("id").eq("user_email", email).eq("id", id).execute()
    if consulta.data:
        supabase.table('favorites').delete().eq("id", id).eq("user_email", email).execute()
    else:
        return jsonify({"erro": "Favorito não encontrado ou não pertence ao usuário"}), 404
    return jsonify({"mensagem" : "Favorito deletado com sucesso"})

@app.route('/favorites/<id>', methods=['PATCH'])
def editar_favorito(id):
    data = request.get_json()
    email = data['email']
    consulta = supabase.table('favorites').select("id").eq("id", id).eq("user_email", email).execute()
    if consulta.data:
        data = request.get_json()
        desc = data['desc']
        tipo = data['tipo']
        valor = data['valor']
        categoria = data.get('categoria', "")
        metodoPag = data.get('metodoPag', "")

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
    
@app.route('/saldo', methods=['GET'])
def checkar_saldo():
    email = request.args.get('email')
    if not email:
        return jsonify({"erro": "Parâmetro 'email' é obrigatório"}), 400

    saldo_atual = buscar_saldo(email)
    return jsonify({
        "mensagem": "Saldo resgatado com sucesso!",
        "saldo": saldo_atual
    }), 200


@app.route("/alexa", methods=["POST"])
def alexa_mock():
    return jsonify({
        "version": "1.0",
        "response": {
            "outputSpeech": {
                "type": "PlainText",
                "text": "Oi, estou funcionando!"
            },
            "shouldEndSession": False
        }
    })

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)