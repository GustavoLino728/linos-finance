import jwt
from flask import request, jsonify, g
import os
from functools import wraps

JWT_SECRET = os.getenv("JWT_SECRET")

def authenticate():
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"erro": "Authorization header missing"}), 401
    
    parts = auth_header.split()
    if parts[0].lower() != 'bearer':
        return jsonify({"erro": "Authorization header must start with Bearer"}), 401
    elif len(parts) == 1:
        return jsonify({"erro": "Token not found"}), 401
    elif len(parts) > 2:
        return jsonify({"erro": "Authorization header must be Bearer token"}), 401

    token = parts[1]
    try:
        # Decodificar usando HS256 e o JWT_SECRET
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=['HS256'],
            audience='authenticated',
            options={"verify_exp": True}
        )
        g.auth_id = payload['sub']  # UUID do usuário
    except jwt.ExpiredSignatureError:
        return jsonify({"erro": "Token expirado"}), 401
    except Exception as e:
        return jsonify({"erro": f"Token inválido: {str(e)}"}), 401

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_response = authenticate()
        if auth_response is not None:
            return auth_response
        return f(*args, **kwargs)
    return decorated