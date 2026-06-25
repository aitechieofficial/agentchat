from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .agents import build_agents
from .config import get_settings
from .council import DISCUSSION_ORDER, ask_agent
from .schemas import CouncilResponse, TopicRequest

ROOT = Path(__file__).resolve().parent.parent
LEGACY_STATIC_DIR = ROOT / "static"
FRONTEND_DIST_DIR = ROOT / "frontend" / "dist"


def _served_index() -> Path:
    if FRONTEND_DIST_DIR.exists():
        return FRONTEND_DIST_DIR / "index.html"
    return LEGACY_STATIC_DIR / "index.html"


def _mount_frontend_assets() -> None:
    if FRONTEND_DIST_DIR.exists():
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST_DIR / "assets"), name="assets")
    else:
        app.mount("/static", StaticFiles(directory=LEGACY_STATIC_DIR), name="static")

app = FastAPI(title="Agent Chat", version="0.1.0")
_mount_frontend_assets()


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(_served_index())


@app.get("/api/agents")
async def list_agents() -> dict[str, object]:
    settings = get_settings()
    return {
        "agents": [
            {
                "key": agent.key,
                "name": agent.name,
                "model": agent.model,
                "color": agent.color,
                "role": agent.role,
            }
            for agent in build_agents(settings)
        ],
        "demo_mode": settings.demo_mode or not settings.litellm_base_url,
    }


@app.post("/api/council", response_model=CouncilResponse)
async def run_council(request: TopicRequest) -> CouncilResponse:
    settings = get_settings()
    agents = {agent.key: agent for agent in build_agents(settings)}
    messages = []

    try:
        for _ in range(request.rounds):
            for agent_key in DISCUSSION_ORDER:
                message = await ask_agent(
                    agent=agents[agent_key],
                    topic=request.topic,
                    messages=messages,
                    settings=settings,
                )
                messages.append(message)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LiteLLM request failed: {exc}") from exc

    return CouncilResponse(
        topic=request.topic,
        messages=messages,
        demo_mode=settings.demo_mode or not settings.litellm_base_url,
    )


def run() -> None:
    uvicorn.run("agentchat.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()
