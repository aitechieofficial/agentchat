# Agent Chat

Agent Chat is a LiteLLM-powered council UI for a configurable set of four agents. The backend stays in Python with `uv`, and the UI has been refactored into React + TypeScript.

## Repo Layout

- `agentchat/`: FastAPI backend and council orchestration
- `frontend/`: React + TypeScript UI
- `AGENTS.md`: repo instructions for future agents
- `SKILLS.md`: repo-specific capability notes

## Run the Backend

```bash
uv sync
uv run agentchat
```

Open `http://localhost:8000`.

## Run the Frontend

The React app lives in `frontend/` and expects Node tooling.

```bash
cd frontend
npm install
npm run dev
```

For production assets:

```bash
cd frontend
npm run build
```

The FastAPI app will serve `frontend/dist` automatically when it exists. Until then it falls back to the legacy static UI.

## Configure LiteLLM

Copy `.env.example` to `.env` and point the app at your LiteLLM proxy:

```bash
cp .env.example .env
```

Set `LITELLM_BASE_URL`, `LITELLM_API_KEY`, and each `AGENT_*_MODEL` alias to match your LiteLLM proxy config. The UI shows each agent's active model next to its name in the agent list and every transcript message. By default the app calls the proxy as an OpenAI-compatible `/v1/chat/completions` endpoint through LiteLLM's Python client.

If `LITELLM_BASE_URL` is not set, the app runs in demo mode so the interface can be tested without model credentials.
