from flask import Flask, request, jsonify
from flask_cors import CORS
from llama_cpp import Llama
from main import main

app = Flask(__name__)
CORS(app)

# Initialize your Llama model once
llm = Llama(
    model_path="/Users/jonnie/Documents/GitHub/photohelperapp/selenium 2/models/mistral-7b-instruct-v0.2.Q5_K_M.gguf",
    n_ctx=1024,
    n_threads=8,
    n_gpu_layers=32,
    verbose=False,
)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json or {}

    camera = data.get("camera", "Sony a6700")
    location = data.get("location", "California State University Fullerton Pollak Library")
    additional_equipment = data.get("additional_equipment", "None")

    prompt = f"""
    Avoid using ``` or any special formating:
    Camera: {camera}  
    Locations: {location}
    Additional Equipment: {additional_equipment}  

    Incorporate the location by referencing specific environmental features of the Pollak Library (such as walkways, stairs, arches, windows, trees, courtyard, etc.) as natural framing elements, backdrops, or lighting opportunities. Use the setting to suggest composition, posing, or light usage ideas.

    Each tip should:
    - Start with a bolded title
    - Include 1–2 sentences of factual explanation
    - Be formatted as a bullet list

    Do not suggest:
    - Manual focus (use Eye AF or Lock-on AF instead)
    - Auto exposure or exposure compensation
    - Aperture smaller than f2.8 
    - Creative styles or presets (shoot in RAW only)
    - Don't use tripod unless doing some technique like long exposures

    Always suggest:
    - Apertures at f/2.8 or faster for portraits
    - Use base ISO
    - Natural Framing
    - Embrace the time of day (e.g., golden hour, night time)
    - It’s okay to go above 1/500s for shutter speed.  

    Tips must include specific suggestions for shutter speed, aperture, and ISO to achieve balanced exposure — not just to avoid camera shake.  
    Use auto white balance unless under strong fluorescent lighting.
    """

    response = llm(prompt, max_tokens=2500)
    text = response["choices"][0]["text"].strip()

    if prompt.strip() in text:
        text = text.replace(prompt.strip(), "", 1).strip()

    return jsonify({"output": text})

@app.route("/run-main", methods=["POST"])
def run_main():
    try:
        data = request.get_json()
        print("📦 Request data:", data)

        school = data.get("location")
        if not school:
            print("❌ No location in request")
            return jsonify({"error": "Missing location in request"}), 400

        print("🎓 Calling main with school:", school)
        result = main(school)
        print("✅ main() completed")

        return jsonify({"output": result})
    except Exception as e:
        print("🔥 ERROR:", str(e))  # Print full error to console
        return jsonify({"error": str(e)}), 500
# try:
    
# except Exception as e:
#     return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(host="192.168.1.234", port=5001)
