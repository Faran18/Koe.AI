from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # These defaults match docker-compose.yml service names — override via .env for local (non-docker) runs
    database_url: str = "postgresql://shop:shop@postgres:5432/shop"
    redis_url: str = "redis://redis:6379/0"
    cors_origins: list[str] = ["http://localhost:3000"]
    guest_user_id: str = "00000000-0000-0000-0000-000000000001"

    class Config:
        env_file = ".env"


settings = Settings()
