# AGENTS.md

This repository has two moving parts:

- `agentchat/`: FastAPI backend that orchestrates the council and serves the UI
- `frontend/`: React + TypeScript client for the agent visualization and chat surface

## Working Rules

- Use `uv` for the Python backend.
- Keep API shapes in `agentchat/schemas.py` and `frontend/src/types.ts` aligned.
- Keep the council behavior deterministic enough that demo mode and live LiteLLM mode produce the same UI flow.
- Prefer small, local changes. Do not rewrite the backend and frontend at the same time unless the contract changes.

## Backend Entry Points

- `agentchat/main.py` serves the app and exposes `/api/agents` and `/api/council`.
- `agentchat/council.py` owns model invocation and demo-mode fallback.
- `agentchat/agents.py` defines the four-agent council and their prompts.

## Frontend Entry Points

- `frontend/src/main.tsx` bootstraps the React app.
- `frontend/src/App.tsx` owns the council UI, visualization, and transcript flow.
- `frontend/src/api.ts` is the only module that should talk to the backend.

## Agent Contract

- The backend should expose the agent name, role, model, and color used in the UI.
- The frontend should render the active model next to each agent so users can see what is actually being used.
- The right-side transcript should stay scrollable inside the panel, not grow the full page.
