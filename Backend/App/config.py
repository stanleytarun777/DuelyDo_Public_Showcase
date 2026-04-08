from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "DuelyDo API"
    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")
    anthropic_model: str = Field(default="claude-sonnet-4-20250514", alias="ANTHROPIC_MODEL")
    allowed_origins_raw: str = Field(
        default="http://localhost:5173,http://localhost:4173,http://localhost:8080",
        alias="ALLOWED_ORIGINS",
    )
    max_file_bytes: int = Field(default=5 * 1024 * 1024, alias="MAX_FILE_BYTES")

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins_raw.split(",") if o.strip()]

    model_config = {"env_file": ".env", "populate_by_name": True}


@lru_cache
def get_settings() -> Settings:
    return Settings()
