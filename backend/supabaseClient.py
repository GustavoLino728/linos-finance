from supabase import create_client, Client
from dotenv import load_dotenv
from flask import request
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# def autenticar_usuario():
#     token_header = request.headers.get("Authorization")
#     if not token_header:
#         raise Exception("Authorization não está presente no header")

#     parts = token_header.split(" ")
#     if len(parts) != 2 or parts[0].lower() != "bearer":
#         raise Exception("Formato inválido de Authorization")

#     token = parts[1]
#     try:
#         user = supabase.auth.get_user(token)
#     except Exception:
#         raise Exception("Token Inválido ou Expirado")

#     email = user.user.email
#     return email
