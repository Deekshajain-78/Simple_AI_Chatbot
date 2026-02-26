# Backend wrapper

Run the FastAPI wrapper to expose your `GeminiChatbot` to the frontend.

Install deps:
```bash
py -3.10 -m pip install -r requirements.txt
```

Run server:
```bash
py -3.10 -m uvicorn server:app --reload --port 8000
```

Endpoints:
- `POST /chat` JSON {"message":"..."} -> {"reply":"..."}
- `WS  /ws` send text messages, server streams chunks and finally `__END__` marker

If you see CORS errors, confirm the frontend origin and update `server.py` CORS settings.
