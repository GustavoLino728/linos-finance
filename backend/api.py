from main import inserir_lancamento, cadastrar_usuario, get_balance, salvar_favorito as salvar_favorito_func
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
    

@app.route('/favorites', methods=['POST'])
def create_favorites():
    data = request.get_json()
    email = data['email']
    tipo = data['tipo']
    desc = data['desc']
    valor = data['valor']
    categoria = data.get('categoria', "")
    metodoPag = data.get('metodoPag', "")

    response = salvar_favorito_func(email, tipo, desc, valor, categoria, metodoPag)
    return jsonify({"mensagem" : "Salvo com sucesso!", "response": response.data}), 201

@app.route('/favorites', methods=['GET'])
def read_favorites():
    email = request.args.get('email') 
    if not email:
        return jsonify({"erro": "Parâmetro 'email' é obrigatório"}), 400
    response = supabase.table("favorites").select("id,type, description, value, category, payment_method").eq("user_email", email).execute()
    return jsonify({"mensagem" : "Listando Favoritos do Usuario", "response" : response.data}),200

@app.route('/favorites/<id>', methods=['DELETE'])
def delete_favorites(id):
    data = request.get_json()
    email = data['email']
    query = supabase.table('favorites').select("id").eq("user_email", email).eq("id", id).execute()
    if query.data:
        supabase.table('favorites').delete().eq("id", id).eq("user_email", email).execute()
    else:
        return jsonify({"erro": "Favorito não encontrado ou não pertence ao usuário"}), 404
    return jsonify({"mensagem" : "Favorito deletado com sucesso"})

@app.route('/favorites/<id>', methods=['PATCH'])
def updata_favorites(id):
    data = request.get_json()
    email = data['email']
    query = supabase.table('favorites').select("id").eq("id", id).eq("user_email", email).execute()
    if query.data:
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
        return jsonify({"mensagem": "Favorito editado com sucesso!", "response" : newFavorito }), 200
    else:
        return jsonify({"mensagem": "Favorito não encontrado ou não pertence ao usuário"}), 404
    
@app.route('/balance', methods=['GET'])
def check_balance():
    email = request.args.get('email')
    if not email:
        return jsonify({"erro": "Parâmetro 'email' é obrigatório"}), 400

    balance_atual = get_balance(email)
    return jsonify({
        "mensagem": "balance resgatado com sucesso!",
        "balance": balance_atual
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