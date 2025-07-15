import time
from llama_cpp import Llama

# Load the model
llm = Llama(
    model_path="/Users/jonnie/Documents/GitHub/photohelperapp/selenium 2/models/mistral-7b-instruct-v0.2.Q5_K_M.gguf",
    n_ctx=1024,
    n_threads=8,
    n_gpu_layers=32,
    verbose=False
)

prompt = prompt = f"""
    ## 📷 Portrait Photography Tips — Markdown Format

**Camera:** Sony a6700  
**Location:** CSUF – Palm Tree Path  
**Weather:** Partly cloudy, 80°F high, soft diffused light with occasional sun  
**Time:** 3PM — late afternoon with warm tones and shifting shadows

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

- Manual focus (use Eye AF or Lock-on AF)  
- Auto exposure or exposure compensation  
- Apertures smaller than f/2.8  
- Creative styles or in-camera filters (RAW only)  
- Tripod usage unless doing long exposure  
- Manual white balance unless under fluorescent lighting  
- Example images or prompt text in output

---

### Goal:

Provide technically sound, creative portrait tips using Palm Tree Path, partly cloudy weather, and **late afternoon lighting**, formatted in Markdown. Include one bonus tip
"""

# Start timing
t0 = time.time()
first_token_time = None

print("Response:\n", end="", flush=True)

# Stream the response token-by-token with typing effect
text_buffer = ""
for i, chunk in enumerate(llm(prompt, max_tokens=3000, stream=True)):
    token = chunk["choices"][0]["text"]
    
    # Record the time of the first token
    if first_token_time is None:
        first_token_time = time.time()
        elapsed = round(first_token_time - t0, 3)
        print(f"\n⏱️ First token generated after {elapsed} seconds.\n")

    print(token, end="", flush=True)

print("\n\n✅ Done.")