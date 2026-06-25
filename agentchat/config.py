from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    litellm_base_url: str | None = None
    litellm_api_key: str | None = None
    litellm_proxy_mode: bool = True
    agent_1_name: str = "Agent 1"
    agent_1_role: str = "Systems thinker"
    agent_1_model: str | None = None
    agent_1_color: str = "#f59e0b"
    agent_2_name: str = "Agent 2"
    agent_2_role: str = "Facilitator"
    agent_2_model: str | None = None
    agent_2_color: str = "#22c55e"
    agent_3_name: str = "Agent 3"
    agent_3_role: str = "Contrarian analyst"
    agent_3_model: str | None = None
    agent_3_color: str = "#38bdf8"
    agent_4_name: str = "Agent 4"
    agent_4_role: str = "Ethical reviewer"
    agent_4_model: str | None = None
    agent_4_color: str = "#a78bfa"
    qwen_model: str = "qwen"
    gpt_model: str = "gpt"
    grok_model: str = "grok"
    claude_model: str = "claude"
    demo_mode: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
