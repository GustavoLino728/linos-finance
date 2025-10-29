from main import save_favorites
from supabaseClient import supabase, supabase_admin
from auth_middleware import requires_auth
from flask import Blueprint, request, jsonify, Flask, g
from flask_cors import CORS

favorites_bp = Blueprint('favorites', __name__)
origins = [
    "http://localhost:3000",
    "https://linos-finance.vercel.app"
]

CORS(favorites_bp, resources={r"/*": {"origins": origins}}, supports_credentials=True)

@favorites_bp.route('/favorites', methods=['POST'])
@requires_auth
def create_favorites():
    data = request.get_json()
    auth_id = g.auth_id
    transaction_type = data['transaction_type']
    description = data['description']
    value = data['value']
    category = data.get('category', "")
    payment_method = data.get('payment_method', "")

    response = save_favorites(auth_id, transaction_type, description, value, category, payment_method)
    return jsonify({"mensagem" : "Salvo com sucesso!", "response": response.data}), 201


@favorites_bp.route('/favorites', methods=['GET'])
@requires_auth
def read_favorites():
    auth_id = g.auth_id
    response = supabase_admin.table("favorites").select("id, type, description, value, category, payment_method").eq("auth_id", auth_id).execute()
    return jsonify({"mensagem" : "Listando Favoritos do Usuario", "response" : response.data}),200


@favorites_bp.route('/favorites/<id>', methods=['DELETE'])
@requires_auth
def delete_favorites(id):
    auth_id = g.auth_id
    query = supabase_admin.table('favorites').select("id").eq("auth_id", auth_id).eq("id", id).execute()
    if query.data:
        supabase_admin.table('favorites').delete().eq("id", id).eq("auth_id", auth_id).execute()
    else:
        return jsonify({"erro": "Favorito não encontrado ou não pertence ao usuário"}), 404
    return jsonify({"mensagem" : "Favorito deletado com sucesso"})


@favorites_bp.route('/favorites/<id>', methods=['PATCH'])
@requires_auth
def update_favorites(id):
    auth_id = g.auth_id
    query = supabase_admin.table('favorites').select("id").eq("id", id).eq("auth_id", auth_id).execute()
    if query.data:
        data = request.get_json()
        description = data['description']
        transaction_type = data['transaction_type']
        value = data['value']
        category = data.get('category', "")
        payment_method = data.get('payment_method', "")

        newFavorito = supabase_admin.table('favorites').update({
            "description": description,
            "type": transaction_type,
            "value": value,
            "category": category,
            "payment_method": payment_method
        }).eq('auth_id', auth_id).eq('id', id).execute()
        return jsonify({"mensagem": "Favorito editado com sucesso!", "response" : newFavorito }), 200
    else:
        return jsonify({"mensagem": "Favorito não encontrado ou não pertence ao usuário"}), 404