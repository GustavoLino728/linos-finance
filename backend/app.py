from main import create_transaction, get_balance
from routes.auth import auth_bp
from routes.favorites import favorites_bp
from supabaseClient import supabase
from flask import request, jsonify, Flask
from flask_cors import CORS

app = Flask(__name__)

origins = [
    "http://localhost:3000",
    "https://organizacao-financeira-app.vercel.app"
]

CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(favorites_bp)

@app.route("/meu-perfil")
def meu_perfil():
    return jsonify({"msg": "ok"})

@app.route('/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    email = data['email'] 

    create_transaction(email, data['data'], data['transaction_type'], data['description'], data['value'],
                      data.get('category', ""), data.get('payment_method', ""),
                      data.get('parcelado', False), data.get('parcelas', 1))
    return jsonify({"mensagem": "Lançamento adicionado com sucesso"}), 201


@app.route('/balance', methods=['GET'])
def check_balance():
    email = request.args.get('email')
    if not email:
        return jsonify({"erro": "Parâmetro 'email' é obrigatório"}), 400

    balance_atual = get_balance(email)
    return jsonify({
        "mensagem": "Saldo resgatado com sucesso!",
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