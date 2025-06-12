from flask import Flask, request, jsonify
from flask_cors import CORS
from main import main  # <-- import function directly

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["POST"])
def run_script():
    try:
        result = main()  # direct function call, much faster
        return jsonify({"output": result})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True, host="192.168.1.234")
