from flask_cors import CORS
from flask import request, jsonify, Flask, g
from routes.auth import auth_bp
from routes.favorites import favorites_bp
from routes.goals import goals_bp
from routes.telegram import telegram_bp
from main import create_transaction, get_sheets_cell, get_last_transactions, get_user_spend_goal, get_sheets_cell, update_user_spend_goal
from auth_middleware import requires_auth
from rate_limiter import limiter
from email_service import init_mail
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

app = Flask(__name__)
init_mail(app)
limiter.init_app(app)

origins = [
    "http://localhost:3000",
    "https://linos-finance.vercel.app",
    "http://localhost:5678",
]

CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(favorites_bp)
app.register_blueprint(goals_bp)
app.register_blueprint(telegram_bp)

@app.route('/', methods=['GET'])
def online_check():
    return jsonify({"mensagem": "A API está online"}), 200

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

    balance_atual = get_sheets_cell(auth_id, cell='B9')
    return jsonify({
        "mensagem": "Saldo resgatado com sucesso!",
        "balance": balance_atual
    }), 200
    
@app.route('/spent', methods=['GET'])
@requires_auth
def check_total_spent_monthly():
    auth_id = g.auth_id

    spent = get_sheets_cell(auth_id, cell='B7')
    return jsonify({
        "mensagem": "Total Gasto resgatado com sucesso!",
        "spent": spent
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
    
@app.route('/users/<auth_id>/spend-goal-progress', methods=['GET'])
def get_spend_goal_progress(auth_id):
    try:
        meta = get_user_spend_goal(auth_id)
        if meta is None:
            return jsonify({"error": "Meta mensal não definida"}), 404

        spent_str = get_sheets_cell(auth_id, cell='B7')
        
        total_gasto = 0
        if spent_str:
            spent_clean = spent_str.replace('R$', '').replace('.', '').replace(',', '.').strip()
            total_gasto = float(spent_clean) if spent_clean else 0

        saldo_restante = max(meta - total_gasto, 0)

        return jsonify({
            "meta_mensal": meta,
            "total_gastos": total_gasto,
            "saldo_restante": saldo_restante
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/users/<auth_id>/spend-goal', methods=['POST'])
def update_spend_goal(auth_id):
    data = request.get_json()
    if not data or "spend_goal" not in data:
        return jsonify({"error": "Campo 'spend_goal' é obrigatório"}), 400

    try:
        spend_goal = float(data['spend_goal'])
        success = update_user_spend_goal(auth_id, spend_goal)
        
        if success:
            return jsonify({"message": "Meta mensal atualizada com sucesso", "spend_goal": spend_goal})
        else:
            return jsonify({"error": "Erro ao atualizar meta"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)