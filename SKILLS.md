# SKILLS.md

Project-specific skills for this repo:

## Council Wiring

- Input: a topic and round count
- Output: a council transcript from the configured agents
- Source of truth: `/api/council`

## Agent Configuration

- Agent names, roles, colors, and model aliases come from environment-backed settings
- Default values are safe for demo mode
- Live model use depends on a configured LiteLLM proxy

## UI Refactor

- The frontend is React + TypeScript
- Visual state should be derived from backend agent metadata, not duplicated by hand
- Keep the transcript list and the visual council in sync with the same message data

## Validation

- Backend checks should use `uv`
- Frontend checks should use the React build tooling in `frontend/`
- Prefer verifying the `/api/agents` and `/api/council` contracts before touching visuals
