# rate_limiter.py
from flask_limiter import Limiter
from flask import request

def get_user_identifier():
    auth = request.headers.get("Authorization")
    if auth:
        return f"auth:{hash(auth)}"

    if request.method in ("POST", "PUT", "PATCH"):
        data = request.get_json(silent=True) or {}
        email = data.get("email")
        if email:
            return f"email:{email}"

    return f"ip:{request.remote_addr}"

limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)
