import time
from llama_cpp import Llama

# Load the model
llm = Llama(
    model_path="/Users/jonnie/Documents/GitHub/photohelperapp/selenium 2/models/mistral-7b-instruct-v0.2.Q5_K_M.gguf",
    n_ctx=512,
    n_threads=8,
    n_gpu_layers=35,
    verbose=False
)

prompt = """
Camera: Sony a6700  
Additional Equipment: None  

Give practical tips for shooting golden hour portraits using the camera and equipment listed above.

Each tip should:
- Start with a bolded title
- Include 1–2 sentences of factual explanation
- Be formatted as a bullet list

Do not suggest:
- Manual focus (use Eye AF or Lock-on AF instead)
- Auto exposure or exposure compensation
-Apeture smaller then f2.8 
- Creative styles or presets (shoot in RAW only)
- Don't use tripod unless doing some technique like long exposures

Always suggest:
-Apertures at f/2.8 or faster for portraits
-Use base ISO
-Natural Framming
-Embrace the time of day(exp. golden hour, night time)
-It’s okay to go above 1/500s for shutter speed.  
Tips must include specific suggestions for shutter speed, aperture, and ISO to achieve balanced exposure — not just to avoid camera shake.  
Use auto white balance unless under strong fluorescent lighting.
"""

# Start timing
t0 = time.time()
first_token_time = None

print("Response:\n", end="", flush=True)

# Stream the response token-by-token with typing effect
text_buffer = ""
for i, chunk in enumerate(llm(prompt, max_tokens=1000, stream=True)):
    token = chunk["choices"][0]["text"]
    
    # Record the time of the first token
    if first_token_time is None:
        first_token_time = time.time()
        elapsed = round(first_token_time - t0, 3)
        print(f"\n⏱️ First token generated after {elapsed} seconds.\n")

    print(token, end="", flush=True)
    time.sleep(0.01)  # Typing effect speed

print("\n\n✅ Done.")
