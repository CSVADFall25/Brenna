#run "uvicorn main:app --reload" to get started
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI()

class StickerRequest(BaseModel):
    prompt: str

@app.post("/generate-sticker")
async def generate_sticker(req: StickerRequest):
    full_prompt = (
        f"Generate a 512x512 PNG sticker with transparent background "
        f"in a cute scrapbook style: {req.prompt}"
    )
    img_resp = client.images.generate(
        model="gpt-image-1-mini",
        prompt=full_prompt,
        size="auto",
    )

    b64_data = img_resp.data[0].b64_json
    return {"image_b64": b64_data}
