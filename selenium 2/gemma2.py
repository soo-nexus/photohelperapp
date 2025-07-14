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
**Location:** CSUF – Pollak Library  
**Weather:** Partly cloudy, 80°F high, soft diffused light with occasional sun.

---

### Instructions:

Generate portrait photography tips for a shoot at Pollak Library, considering partly cloudy weather and its effect on lighting. Use architectural features (arches, walkways, stairs, trees, windows, courtyard) for framing, backgrounds, or light modifiers.

---

### Output Format (Markdown):

- One overarching tip on how weather affects lighting and mood.
- Follow with 3 bullet-point tips:
  - **Bolded title**
  - 1–2 sentences on technique, location, and weather
  - Camera settings: Shutter Speed, Aperture (f/2.8 or wider), ISO (100 preferred)

---

### Must Include:

- Aperture f/2.8 or faster  
- Base ISO (100) unless low light  
- Auto White Balance unless strong fluorescent light  
- Natural framing from environment  
- Shutter speeds above 1/500s allowed  
- Use weather and time of day creatively

---

### Do Not Include:

- Manual focus (use Eye AF or Lock-on AF)  
- Auto exposure or exposure compensation  
- Apertures smaller than f/2.8  
- Creative styles or filters (RAW only)  
- Tripod use unless long exposure  
- Manual white balance unless fluorescent

---

### Goal:

Provide technically sound, creative portrait tips using Pollak Library and partly cloudy lighting, formatted in Markdown with camera settings.
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