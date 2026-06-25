from pydantic import BaseModel, Field


class TopicRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=800)
    rounds: int = Field(default=1, ge=1, le=3)


class CouncilMessage(BaseModel):
    agent_key: str
    agent_name: str
    model: str
    role: str
    color: str
    content: str


class CouncilResponse(BaseModel):
    topic: str
    messages: list[CouncilMessage]
    demo_mode: bool
