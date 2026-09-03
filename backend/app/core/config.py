from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    SECRET_KEY: str = "mahasetu-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "sqlite+aiosqlite:///./mahasetu.db"

    INTERNAL_API_KEY: str = "mahasetu-internal-key-2026"

    CITIZEN_REGISTRY_URL: str = "http://localhost:8000"
    EDUCATION_DEPT_URL: str = "http://localhost:8000"
    REVENUE_DEPT_URL: str = "http://localhost:8000"
    WELFARE_DEPT_URL: str = "http://localhost:8000"

    RATE_LIMIT_PER_MINUTE: int = 20

    FRONTEND_URL: str = "http://localhost:5173"

    ENVIRONMENT: str = "development"

    model_config = {"env_file": ".env"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
