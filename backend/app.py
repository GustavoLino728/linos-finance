from main import create_transaction, get_balance, get_last_transactions
from routes.auth import auth_bp
from routes.favorites import favorites_bp
from supabaseClient import supabase
from auth_middleware import requires_auth
from flask import request, jsonify, Flask, g
from flask_cors import CORS


app = Flask(__name__)

origins = [
    "http://localhost:3000",
    "https://organizacao-financeira-app.vercel.app"
]

CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(favorites_bp)

@app.route('/transactions', methods=['POST'])
@requires_auth
def add_transaction():
    data = request.get_json()
    auth_id = g.auth_id
    
    create_transaction(auth_id, data['data'], data['transaction_type'], data['description'], data['value'],
                      data.get('category', ""), data.get('payment_method', ""),
                      data.get('parcelado', False), data.get('parcelas', 1))
    return jsonify({"mensagem": "Lançamento adicionado com sucesso"}), 201

@app.route('/transactions/recent', methods=['GET'])
@requires_auth
def recent_transactions():
    auth_id = g.auth_id
    try:
        transactions = get_last_transactions(auth_id)
        return jsonify({"transactions": transactions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/balance', methods=['GET'])
@requires_auth
def check_balance():
    auth_id = g.auth_id

    balance_atual = get_balance(auth_id)
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