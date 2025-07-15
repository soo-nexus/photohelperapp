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
    weather = data.get("weather", None)
    time = data.get("time", None)
    prompt = f"""
    ## 📷 Portrait Photography Tips — Markdown Format

    **Camera:** {camera}  
    **Location:** {location} 
    **Weather:** {weather}  
    **Time:** {time}
    ---

    ### Instructions:

    - Generate portrait photography tips for a shoot at Palm Tree Path  
    - Consider partly cloudy weather and 3PM lighting conditions  
    - Use architectural and natural features (arches, walkways, stairs, trees, windows, courtyard) as:  
    - Natural frames  
    - Backgrounds  
    - Light modifiers

    ---

    ### Output Format (Markdown):

    - One overarching tip on how **weather and time of day** affect light and mood
    - Follow with 3 bullet-point portrait tips  
    Each tip must include:
    - **Bolded title**
    - 1–3 **bullet points** explaining how the technique uses:
        - The location  
        - The weather  
        - The time of day (3PM light)
    - One **bullet point**:  
        `Shutter Speed`, `Aperture (f/2.8 or wider)`, `ISO (100 preferred)`

    ---

    ### Must Include:

    - Aperture f/2.8 or faster  
    - Base ISO (100) unless needed  
    - Auto White Balance unless under strong fluorescent light  
    - Natural environmental framing  
    - Shutter speeds above 1/500s allowed  
    - Embrace weather and time (cloud cover, sun angle, shadows)

    ---

    ### Do Not Include:
    - Any repeating of the prompt in the response
    - Manual focus (use Eye AF or Lock-on AF)  
    - Auto exposure or exposure compensation  
    - Apertures smaller than f/2.8  
    - Creative styles or in-camera filters (RAW only)  
    - Tripod usage unless doing long exposure  
    - Manual white balance unless under fluorescent lighting  
    - Example images or prompt text in output

    ---

    ### Goal:

    Provide technically sound, creative portrait tips using Palm Tree Path, partly cloudy weather, and **late afternoon lighting**, formatted in React Native Markdown.
    """

    response = llm(prompt, max_tokens=3000)
    text = response["choices"][0]["text"].strip()

    if prompt.strip() in text:
        text = text.replace(prompt.strip(), "", 1).strip()
        print(text)
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
