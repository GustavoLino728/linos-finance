from flask import request, jsonify, Flask


@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    sheet_url = data.get('sheet_url')

    if not email or not password or not sheet_url:
        return jsonify({"erro": "Email, senha e link da planilha são obrigatórios"}), 400

    user = supabase.auth.sign_up({"email": email, "password": password})

    if user.get("error"):
        return jsonify({"erro": user["error"]["message"]}), 400

    supabase.table("users").insert({
        "email": email,
        "name": name,
        "sheet_url": sheet_url,
        "auth_id": user["user"]["id"]
    }).execute()

    return jsonify({"mensagem": "Usuário cadastrado"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    if response.get("error"):
        return jsonify({"erro": response["error"]["message"]}), 401

    user = response["user"]
    access_token = response["session"]["access_token"]

    return jsonify({
        "access_token": access_token,
        "user": {"id": user["id"], "email": user["email"]}
    }), 200