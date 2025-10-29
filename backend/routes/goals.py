from flask import Blueprint, request, jsonify, Flask, g
from flask_cors import CORS
from supabaseClient import supabase_admin
from auth_middleware import requires_auth
from main import create_goal_supabase


goals_bp = Blueprint('goals', __name__)
origins = [
    "http://localhost:3000",
    "https://linos-finance.vercel.app"
]

CORS(goals_bp, resources={r"/*": {"origins": origins}}, supports_credentials=True)

@goals_bp.route("/goals", methods=['POST'])
@requires_auth
def create_goal():
    data = request.get_json()
    auth_id = g.auth_id
    name = data['name']
    current_value = data['current_value']
    goal_value = data.get('goal_value', "")
    
    new_goal = create_goal_supabase(auth_id, name, goal_value, current_value)
    return jsonify({"mensagem" : "Meta criada com sucesso!", "response": new_goal.data}), 201

@goals_bp.route("/goals", methods=['GET'])
@requires_auth
def read_goals():
    auth_id = g.auth_id
    goals = supabase_admin.table("goals").select("uuid", "name", "current_value", "goal_value").eq("auth_id", auth_id).execute()
    return jsonify({"mensagem" : "Meta criada com sucesso!", "response": goals.data}), 200

@goals_bp.route("/goals/<id>", methods=['DELETE'])
@requires_auth
def delete_goal(id):
    auth_id = g.auth_id
    supabase_admin.table("goals").delete().eq("auth_id", auth_id).eq("uuid", id).execute()
    return jsonify({"mensagem" : "Meta deletada com sucesso"}), 200

@goals_bp.route("/goals/<id>", methods=['PATCH'])
@requires_auth
def aport_goal(id):
    data = request.get_json()
    current_value = data['current_value']
    auth_id = g.auth_id
    supabase_admin.table("goals").update({"current_value": current_value}).eq("auth_id", auth_id).eq("uuid", id).execute()
    return jsonify({"mensagem" : "Meta deletada com sucesso"}), 200