import json

from redis.asyncio import Redis

from app.core.config import settings

SESSION_TTL_SECONDS = 60 * 60 * 24
redis = Redis.from_url(settings.redis_url, decode_responses=True)


async def load_session(session_id: str) -> dict:
    value = await redis.get(f"chat-session:{session_id}")
    return json.loads(value) if value else {}


async def save_session(session_id: str, state: dict) -> None:
    await redis.set(
        f"chat-session:{session_id}",
        json.dumps(state),
        ex=SESSION_TTL_SECONDS,
    )


def merge_intent(state: dict, tool_name: str, args: dict) -> None:
    intent = state.setdefault("shopping_intent", {})
    intent["last_action"] = tool_name
    intent.update({key: value for key, value in args.items() if value is not None})
