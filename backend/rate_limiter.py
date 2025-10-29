from flask_limiter import Limiter
from flask import request

def get_user_identifier():
    if request.is_json:
        data = request.get_json()
        if data and 'email' in data:
            return data['email']
    return request.remote_addr

limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",  
)