from main import save_favorites
from supabaseClient import supabase
from flask import Blueprint, request, jsonify, Flask
from flask_cors import CORS

favorites_bp = Blueprint('favorites', __name__)
origins = [
    "http://localhost:3000",
    "https://organizacao-financeira-app.vercel.app"
]

CORS(favorites_bp, resources={r"/*": {"origins": origins}}, supports_credentials=True)

@favorites_bp.route('/favorites', methods=['POST'])
def create_favorites():
    data = request.get_json()
    email = data['email']
    transaction_type = data['transaction_type']
    description = data['description']
    value = data['value']
    category = data.get('category', "")
    payment_method = data.get('payment_method', "")

    response = save_favorites(email, transaction_type, description, value, category, payment_method)
    return jsonify({"mensagem" : "Salvo com sucesso!", "response": response.data}), 201


@favorites_bp.route('/favorites', methods=['GET'])
def read_favorites():
    email = request.args.get('email') 
    if not email:
        return jsonify({"erro": "Parâmetro 'email' é obrigatório"}), 400
    response = supabase.table("favorites").select("id,type, description, value, category, payment_method").eq("user_email", email).execute()
    return jsonify({"mensagem" : "Listando Favoritos do Usuario", "response" : response.data}),200


@favorites_bp.route('/favorites/<id>', methods=['DELETE'])
def delete_favorites(id):
    data = request.get_json()
    email = data['email']
    query = supabase.table('favorites').select("id").eq("user_email", email).eq("id", id).execute()
    if query.data:
        supabase.table('favorites').delete().eq("id", id).eq("user_email", email).execute()
    else:
        return jsonify({"erro": "Favorito não encontrado ou não pertence ao usuário"}), 404
    return jsonify({"mensagem" : "Favorito deletado com sucesso"})


@favorites_bp.route('/favorites/<id>', methods=['PATCH'])
def update_favorites(id):
    data = request.get_json()
    email = data['email']
    query = supabase.table('favorites').select("id").eq("id", id).eq("user_email", email).execute()
    if query.data:
        data = request.get_json()
        description = data['description']
        transaction_type = data['transaction_type']
        value = data['value']
        category = data.get('category', "")
        payment_method = data.get('payment_method', "")

        newFavorito = supabase.table('favorites').update({
            "description": description,
            "type": transaction_type,
            "value": value,
            "category": category,
            "payment_method": payment_method
        }).eq('user_email', email).eq('id', id).execute()
        return jsonify({"mensagem": "Favorito editado com sucesso!", "response" : newFavorito }), 200
    else:
        return jsonify({"mensagem": "Favorito não encontrado ou não pertence ao usuário"}), 404
