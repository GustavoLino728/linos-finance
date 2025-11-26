from flask import Blueprint, request, jsonify, g
from flask_cors import CORS
from supabaseClient import supabase_admin
from auth_middleware import requires_auth
from datetime import datetime, timedelta
import secrets
import string

telegram_bp = Blueprint('telegram', __name__)
origins = [
    "http://localhost:3000",
    "https://linos-finance.vercel.app"
]

CORS(telegram_bp, resources={r"/*": {"origins": origins}}, supports_credentials=True)


def generate_sync_code():
    """Gera código alfanumérico de 12 caracteres"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(12))


@telegram_bp.route('/integrations/telegram/generate-code', methods=['POST'])
@requires_auth
def generate_code():
    """Gera código de sincronização para o usuário"""
    try:
        auth_id = g.auth_id
        
        # Gerar código único
        sync_code = generate_sync_code()
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        # Verificar se já existe integração para este usuário
        existing = supabase_admin.table("telegram_integrations").select("*").eq("auth_id", auth_id).execute()
        
        if existing.data:
            # Atualizar código existente
            supabase_admin.table("telegram_integrations").update({
                "sync_code": sync_code,
                "code_expires_at": expires_at.isoformat(),
                "synced_at": None  # Resetar sincronização
            }).eq("auth_id", auth_id).execute()
        else:
            # Criar novo registro
            supabase_admin.table("telegram_integrations").insert({
                "auth_id": auth_id,
                "sync_code": sync_code,
                "code_expires_at": expires_at.isoformat(),
                "telegram_id": ""  # Será preenchido na sincronização
            }).execute()
        
        return jsonify({
            "code": sync_code,
            "expires_in": 300,  # 5 minutos em segundos
            "expires_at": expires_at.isoformat()
        }), 200
        
    except Exception as e:
        print(f"❌ Erro ao gerar código: {str(e)}")
        return jsonify({"erro": str(e)}), 500


@telegram_bp.route('/integrations/telegram/sync', methods=['POST'])
def sync_telegram():
    """Sincroniza Telegram com conta do usuário (chamado pelo n8n)"""
    try:
        # Validar API key do n8n
        api_key = request.headers.get('X-API-Key')
        import os
        if api_key != os.getenv('N8N_API_KEY', 'sua-api-key-super-secreta'):
            return jsonify({"erro": "API key inválida"}), 401
        
        data = request.get_json()
        sync_code = data.get('code', '').strip()  # Strip para evitar espaços extras
        telegram_id = data.get('telegram_id')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        username = data.get('username', '')

        print(f"[DEBUG] Código sincronização recebido: '{sync_code}'")
        print(f"[DEBUG] Telegram ID recebido: '{telegram_id}'")

        if not sync_code or not telegram_id:
            return jsonify({"erro": "code e telegram_id são obrigatórios"}), 400

        try:
            result = supabase_admin.table("telegram_integrations")\
                .select("*")\
                .eq("sync_code", sync_code)\
                .maybe_single()\
                .execute()
        except Exception as api_ex:
            # Caso o postgrest retorne vazio (204 No Content) isso evita quebra
            err = getattr(api_ex, "response", None)
            if err and getattr(err, "status_code", None) == 204:
                result = None
            else:
                raise
        
        print(f"[DEBUG] Resultado da busca no banco: {result.data if result else 'Nenhum resultado'}")

        if not result or not result.data:
            return jsonify({
                "success": False,
                "error": "Código inválido ou expirado"
            }), 404

        integration = result.data
        
        expires_at = datetime.fromisoformat(integration['code_expires_at'].replace('Z', '+00:00'))
        print(f"[DEBUG] Código expira em: {expires_at.isoformat()}, UTC agora: {datetime.utcnow().isoformat()}")

        if datetime.utcnow() > expires_at.replace(tzinfo=None):
            return jsonify({
                "success": False,
                "error": "Código expirado. Gere um novo código no app."
            }), 400

        existing_telegram = supabase_admin.table("telegram_integrations")\
            .select("*")\
            .eq("telegram_id", telegram_id)\
            .neq("auth_id", integration['auth_id'])\
            .execute()

        if existing_telegram.data:
            return jsonify({
                "success": False,
                "error": "Este Telegram já está vinculado a outra conta"
            }), 400
        
        supabase_admin.table("telegram_integrations").update({
            "telegram_id": telegram_id,
            "first_name": first_name,
            "last_name": last_name,
            "username": username,
            "synced_at": datetime.utcnow().isoformat(),
            "sync_code": None,
            "code_expires_at": None
        }).eq("id", integration['id']).execute()

        return jsonify({
            "success": True,
            "auth_id": integration['auth_id'],
            "message": f"Telegram sincronizado com sucesso! Olá {first_name} 👋"
        }), 200

    except Exception as e:
        import traceback
        print(f"❌ Erro na sincronização: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Erro interno ao sincronizar"
        }), 500

@telegram_bp.route('/user/by-telegram/<telegram_id>', methods=['GET'])
def get_user_by_telegram(telegram_id):
    """Busca usuário por telegram_id (usado pelo n8n)"""
    try:
        # Validar API key do n8n
        api_key = request.headers.get('X-API-Key')
        import os
        if api_key != os.getenv('N8N_API_KEY', 'sua-api-key-super-secreta'):
            return jsonify({"erro": "API key inválida"}), 401
        
        result = supabase_admin.table("telegram_integrations")\
            .select("auth_id, first_name, synced_at")\
            .eq("telegram_id", telegram_id)\
            .single()\
            .execute()
        
        if not result.data or not result.data.get('synced_at'):
            return jsonify({
                "error": "Telegram não sincronizado",
                "message": "Use /sincronizar CODIGO para vincular sua conta"
            }), 404
        
        return jsonify({
            "auth_id": result.data['auth_id'],
            "first_name": result.data['first_name']
        }), 200
        
    except Exception as e:
        print(f"❌ Erro ao buscar usuário: {str(e)}")
        return jsonify({
            "error": "Telegram não encontrado",
            "message": "Use /sincronizar CODIGO para vincular sua conta"
        }), 404


@telegram_bp.route('/integrations/telegram/status', methods=['GET'])
@requires_auth
def get_telegram_status():
    """Retorna status da integração do Telegram do usuário"""
    try:
        auth_id = g.auth_id
        
        result = supabase_admin.table("telegram_integrations")\
            .select("telegram_id, first_name, username, synced_at")\
            .eq("auth_id", auth_id)\
            .single()\
            .execute()
        
        if not result.data or not result.data.get('synced_at'):
            return jsonify({
                "connected": False
            }), 200
        
        return jsonify({
            "connected": True,
            "telegram_id": result.data['telegram_id'],
            "first_name": result.data['first_name'],
            "username": result.data.get('username'),
            "synced_at": result.data['synced_at']
        }), 200
        
    except Exception as e:
        return jsonify({"connected": False}), 200