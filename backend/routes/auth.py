from flask import Blueprint, request, jsonify
from supabaseClient import supabase, supabase_admin
from flask_cors import CORS

auth_bp = Blueprint('auth', __name__)
origins = [
    "http://localhost:3000",
    "https://organizacao-financeira-app.vercel.app"
]

CORS(auth_bp, resources={r"/*": {"origins": origins}}, supports_credentials=True)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    sheet_url = data.get("sheet_url")
    username = data.get("username")
    
    if not email or not password or not sheet_url:
        return jsonify({"error": "Campos obrigatórios faltando"}), 400

    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        user = response.user
    except Exception as e:
        return jsonify({"erro": str(e)}), 400

    if not user:
        return jsonify({"erro": "Falha ao cadastrar usuário"}), 400

    supabase_admin.table("user_profiles").insert({
        "auth_id": user.id,
        "sheet_url": sheet_url,
        "username": username
    }).execute()

    return jsonify({"mensagem": "Usuário cadastrado com sucesso"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    try:
        response = supabase.auth.sign_in_with_password({
        "email": data.get("email"),
        "password": data.get("password")
        })

    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    
    user = response.user

    profile_response = supabase_admin.table("user_profiles").select("username,sheet_url").eq("auth_id", user.id).single().execute()
    username = profile_response.data["username"] if profile_response.data else ""
    sheet_url = profile_response.data["sheet_url"] if profile_response.data else ""

    return jsonify({
        "access_token": response.session.access_token,
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "username": username,
            "sheet_url": sheet_url
        }
    }), 200