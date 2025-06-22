from main import inserirLancamento
from flask import request, jsonify, Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/add-lancamento', methods=['POST'])
def add_lancamento():
    dados = request.get_json()
    data = dados['data']
    tipo = dados['tipo']
    desc = dados['desc']
    valor = dados['valor']
    categoria = dados.get('categoria', "")
    metodoPag = dados.get('metodoPag', "")

    inserirLancamento(data, tipo, desc, valor, categoria, metodoPag)
    return jsonify({"mensagem": "Lançamento adicionado com sucesso"}), 201

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)