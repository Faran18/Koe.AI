import uuid
from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: Optional[str] = Field(default=None, unique=True, index=True)
    is_guest: bool = Field(default=True)

# Phase 1 note: a single guest User row (id = settings.guest_user_id) is seeded
# and every cart hangs off it. Real auth + session-tied users arrive with
# Phase 4's session_id strategy decision — don't build login now.
