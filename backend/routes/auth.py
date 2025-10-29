from flask import Blueprint, request, jsonify
from flask_cors import CORS
from rate_limiter import limiter
from supabaseClient import supabase, supabase_admin
from dotenv import load_dotenv
from email_service import send_reset_email
import os
import re


load_dotenv()

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
    
@auth_bp.route("/auth/forgot-password", methods=['POST'])
@limiter.limit("5 per day")
def forgot_password():
    """Solicita reset de senha via email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"erro": "Email é obrigatório"}), 400
        
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({"erro": "Email inválido"}), 400
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        redirect_url = f"{frontend_url}/reset-password"
        
        print(f"📧 Gerando link de reset para: {email}")
        
        # Gerar link via Supabase Admin
        response = supabase_admin.auth.admin.generate_link({
            "type": "recovery",
            "email": email,
            "options": {"redirect_to": redirect_url}
        })
        
        # Extrair o link gerado
        reset_link = response.properties.action_link
        
        print(f"🔗 Link gerado: {reset_link[:50]}...")
        
        # Enviar email usando Flask-Mail
        email_sent = send_reset_email(email, reset_link)
        
        if email_sent:
            print(f"✅ Email enviado com sucesso")
        else:
            print(f"⚠️ Falha ao enviar email")
        
        # Sempre retorna sucesso por segurança
        return jsonify({
            "mensagem": "Se o email estiver cadastrado, você receberá um link de recuperação",
            "sucesso": True
        }), 200
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        print(traceback.format_exc())
        
        return jsonify({
            "mensagem": "Se o email estiver cadastrado, você receberá um link de recuperação",
            "sucesso": True
        }), 200


@auth_bp.route("/auth/reset-password", methods=['POST'])
def reset_password():
    """Atualiza a senha do usuário"""
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        new_password = data.get('password')
        
        if not access_token or not new_password:
            return jsonify({"erro": "Token e senha são obrigatórios"}), 400
        
        if len(new_password) < 6:
            return jsonify({"erro": "Senha deve ter pelo menos 6 caracteres"}), 400
        
        # Decodificar token para pegar user_id
        import jwt
        decoded = jwt.decode(access_token, options={"verify_signature": False})
        user_id = decoded.get('sub')
        
        print(f"🔑 Atualizando senha para user_id: {user_id}")
        
        response = supabase_admin.auth.admin.update_user_by_id(
            uid=user_id,
            attributes={"password": new_password}
        )
        
        print(f"✅ Senha atualizada com sucesso")
        
        return jsonify({
            "mensagem": "Senha atualizada com sucesso",
            "sucesso": True
        }), 200
        
    except Exception as e:
        print(f"❌ Erro ao atualizar senha: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"erro": "Erro ao atualizar senha. O link pode ter expirado."}), 500