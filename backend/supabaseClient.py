from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def autenticar_usuario():
    if not request.headers.get("Authorization"):
        raise Exception("Não está presente no header")
    else:
        parts = request.headers.get("Authorization").split(" ")
        token = parts[1] if len(parts) > 1 else parts[0]
    
        try:
            user = supabase.auth.get_user(token)
        except Exception:
            raise Exception("Token Invalido ou Expirado")
        
        email = user.user.email
        return email
