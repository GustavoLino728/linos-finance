from flask import Blueprint, request, jsonify, Flask, g
from flask_cors import CORS
from main import create_goal_supabase

goals_bp = Blueprint('goals', __name__)
origins = [
    "http://localhost:3000",
    "https://organizacao-financeira-app.vercel.app"
]

CORS(goals_bp, resources={r"/*": {"origins": origins}}, supports_credentials=True)

@goals_bp.route("/goals", methods=['POST'])
def create_goal():
    data = request.get_json()
    auth_id = g.auth_id
    name = data['name']
    current_value = data['current_value']
    goal_value = data.get('goal_value', "")
    
    new_goal = create_goal_supabase(auth_id, name, goal_value, current_value)
    return new_goal
    