import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

payload = {
    'sub': 'b742604a-afac-49dc-8c8c-a81bb65b5717',
    'aud': 'authenticated',
    'exp': datetime.utcnow() + timedelta(days=365*5)  # 5 anos
}

token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
print("=" * 60)
print("USE ESTE TOKEN NO N8N:")
print("=" * 60)
print(token)
print("=" * 60)