# Agent Chat

Agent Chat is a LiteLLM-powered council UI for four agents: Qwen, GPT, Grok, and Claude. The left panel visualizes the agents in motion, and the right panel lets you provide a topic and review the council transcript.

## Run with uv

```bash
uv sync
uv run agentchat
```

Open `http://localhost:8000`.

## Configure LiteLLM

Copy `.env.example` to `.env` and point the app at your LiteLLM proxy:

```bash
cp .env.example .env
```

Set `LITELLM_BASE_URL`, `LITELLM_API_KEY`, and each `AGENT_*_MODEL` alias to match your LiteLLM proxy config. The UI shows each agent's active model next to its name in the agent list and every transcript message. By default the app calls the proxy as an OpenAI-compatible `/v1/chat/completions` endpoint through LiteLLM's Python client.

If `LITELLM_BASE_URL` is not set, the app runs in demo mode so the interface can be tested without model credentials.
