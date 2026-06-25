from dataclasses import dataclass

from .config import Settings


@dataclass(frozen=True)
class Agent:
    key: str
    name: str
    model: str
    color: str
    role: str
    system_prompt: str


def build_agents(settings: Settings) -> list[Agent]:
    return [
        Agent(
            key="agent_1",
            name=settings.agent_1_name,
            model=settings.agent_1_model or settings.qwen_model,
            color=settings.agent_1_color,
            role=settings.agent_1_role,
            system_prompt=(
                f"You are {settings.agent_1_name}, {settings.agent_1_role} in a four-agent council. "
                "Focus on structure, hidden assumptions, and practical next steps. "
                "Keep responses concise and address the other agents when useful."
            ),
        ),
        Agent(
            key="agent_2",
            name=settings.agent_2_name,
            model=settings.agent_2_model or settings.gpt_model,
            color=settings.agent_2_color,
            role=settings.agent_2_role,
            system_prompt=(
                f"You are {settings.agent_2_name}, {settings.agent_2_role} in a four-agent council. Synthesize ideas, "
                "ask clarifying questions, and move the discussion toward a decision. "
                "Keep responses concise and collaborative."
            ),
        ),
        Agent(
            key="agent_3",
            name=settings.agent_3_name,
            model=settings.agent_3_model or settings.grok_model,
            color=settings.agent_3_color,
            role=settings.agent_3_role,
            system_prompt=(
                f"You are {settings.agent_3_name}, {settings.agent_3_role} in a four-agent council. Probe weak logic, "
                "identify risks, and propose sharper alternatives without derailing the team. "
                "Keep responses concise."
            ),
        ),
        Agent(
            key="agent_4",
            name=settings.agent_4_name,
            model=settings.agent_4_model or settings.claude_model,
            color=settings.agent_4_color,
            role=settings.agent_4_role,
            system_prompt=(
                f"You are {settings.agent_4_name}, {settings.agent_4_role} in a four-agent council. "
                "Look for impact, tradeoffs, and ways to make the plan more useful and safe. "
                "Keep responses concise."
            ),
        ),
    ]
