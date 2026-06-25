from __future__ import annotations

from typing import Any

from litellm import acompletion

from .agents import Agent
from .config import Settings
from .schemas import CouncilMessage


DISCUSSION_ORDER = ["agent_1", "agent_2", "agent_3", "agent_4", "agent_2"]


def _history_text(topic: str, messages: list[CouncilMessage]) -> str:
    transcript = "\n".join(f"{message.agent_name}: {message.content}" for message in messages)
    if not transcript:
        return f"Topic: {topic}\nNo council messages yet."
    return f"Topic: {topic}\n\nCouncil transcript so far:\n{transcript}"


def _demo_response(agent: Agent, topic: str, messages: list[CouncilMessage]) -> str:
    turn = len(messages) + 1
    if agent.key == "agent_1":
        return (
            f"I would frame '{topic}' as a system with goals, constraints, stakeholders, "
            "and feedback loops. The first useful move is to define what success would look like."
        )
    if agent.key == "agent_3":
        return (
            "The weak point is assuming the first framing is complete. We should stress-test "
            "cost, failure modes, and what evidence would change our mind."
        )
    if agent.key == "agent_4":
        return (
            "I would add impact and consent checks. A good council answer should name who benefits, "
            "who could be burdened, and how the team will monitor unintended effects."
        )
    if turn >= 5:
        return (
            "Synthesis: define success, test the riskiest assumptions, include impact safeguards, "
            "then turn the discussion into a short action plan with owners and review points."
        )
    return (
        "I hear three threads: structure, risk, and impact. Let us keep the next pass focused on "
        "what decision this council needs to make."
    )


def _api_base(settings: Settings) -> str:
    base_url = (settings.litellm_base_url or "").rstrip("/")
    if settings.litellm_proxy_mode and not base_url.endswith("/v1"):
        return f"{base_url}/v1"
    return base_url


def _litellm_model(agent: Agent, settings: Settings) -> str:
    if not settings.litellm_proxy_mode:
        return agent.model
    if agent.model.startswith("openai/"):
        return agent.model
    return f"openai/{agent.model}"


async def ask_agent(
    *,
    agent: Agent,
    topic: str,
    messages: list[CouncilMessage],
    settings: Settings,
) -> CouncilMessage:
    if settings.demo_mode or not settings.litellm_base_url:
        content = _demo_response(agent, topic, messages)
    else:
        response: Any = await acompletion(
            model=_litellm_model(agent, settings),
            api_base=_api_base(settings),
            api_key=settings.litellm_api_key or "unused",
            messages=[
                {"role": "system", "content": agent.system_prompt},
                {"role": "user", "content": _history_text(topic, messages)},
            ],
            temperature=0.7,
            max_tokens=260,
        )
        content = response.choices[0].message.content or ""

    return CouncilMessage(
        agent_key=agent.key,
        agent_name=agent.name,
        model=agent.model,
        role=agent.role,
        color=agent.color,
        content=content.strip(),
    )
