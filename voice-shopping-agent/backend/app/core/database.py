from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

engine = create_engine(settings.database_url, echo=False)


def init_db() -> None:
    """Dev-only convenience: create tables directly from models.
    Once Phase 0's Alembic setup is producing real migrations, stop calling
    this and run `alembic upgrade head` instead — keep only one source of truth."""
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
