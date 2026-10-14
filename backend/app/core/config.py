from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

POSTGRES_DRIVER_PREFIX = "postgresql+psycopg://"
POSTGRES_URL_PREFIXES = ("postgres://", "postgresql://")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./data/leadflow.db"
    cors_origins: list[str] = ["http://localhost:3000"]

    @field_validator("database_url")
    @classmethod
    def use_psycopg_driver(cls, value: str) -> str:
        for prefix in POSTGRES_URL_PREFIXES:
            if value.startswith(prefix):
                return POSTGRES_DRIVER_PREFIX + value.removeprefix(prefix)
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
