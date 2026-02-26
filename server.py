from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

# Import the GeminiChatbot from your CLI file
from chatbot import GeminiChatbot

app = FastAPI(title="Chatbot API")

# Allow local frontend dev origin; adjust as needed
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # loosened for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


bot = GeminiChatbot()


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """Simple REST endpoint: accepts JSON {message} and returns {reply}."""
    # Run the generator in a thread to avoid blocking the event loop
    loop = asyncio.get_running_loop()

    def run_stream():
        chunks = []
        for chunk in bot.send_message_stream(req.message):
            chunks.append(chunk)
        return "".join(chunks)

    reply = await loop.run_in_executor(None, run_stream)
    return {"reply": reply}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            # Send chunks as they arrive from the generator
            for chunk in bot.send_message_stream(data):
                await ws.send_text(chunk)
            # optional: send a final marker
            await ws.send_text("__END__")
    except WebSocketDisconnect:
        return
