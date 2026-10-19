from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

engine = create_engine(settings.database_url, echo=False, pool_pre_ping=True)


def init_db() -> None:
    """Create missing model tables; this does not migrate existing columns."""
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
