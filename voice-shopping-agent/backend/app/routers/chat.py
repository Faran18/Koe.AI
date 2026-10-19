# backend/app/routers/chat.py
import asyncio
import json
import logging
from app.agent.dispatcher import execute_tool
from app.agent.llm_client import GroqClient
from app.agent.session import load_session, merge_intent, save_session
from app.agent.tool_registry import get_groq_tool_schemas
from fastapi import APIRouter
import httpx
import openai

logger = logging.getLogger(__name__)

router = APIRouter()
llm_client = GroqClient()

SYSTEM_PROMPT = """You are a focused shopping assistant for an online fashion store.

Core Responsibilities:
- Use search_products and get_filters to help customers browse and filter clothing.
- The catalog includes categories, sizes, prices, ratings, descriptions, and specifications. It has no stock, gender, color, brand, or fit data; never invent those attributes.
- Use retrieve_store_info for questions regarding store policies, shipping, returns, exchanges, or payment.
- Use add_to_cart, view_cart, update_cart_item, and remove_from_cart to manage the customer's cart.
- Handle small talk and greetings politely in plain text.

Out-of-Scope Requests:
- If the user asks about topics completely unrelated to fashion shopping, clothing, or this store (such as politics, world news, fuel prices, or general knowledge), politely decline in plain text: "I'm only able to assist with fashion shopping and store inquiries. How can I help you with your wardrobe today?"
- DO NOT attempt to call any tools for out-of-scope topics.

Keep replies short, concise, and natural."""


def sanitize_messages_for_llm(messages: list[dict]) -> list[dict]:
    clean = []
    for msg in messages:
        role = msg.get("role", "user")
        entry = {"role": role}

        if role == "assistant":
            if msg.get("tool_calls"):
                entry["tool_calls"] = msg["tool_calls"]
                entry["content"] = msg.get("content") or None
            else:
                entry["content"] = msg.get("content") or ""
        elif role == "tool":
            entry["tool_call_id"] = msg.get("tool_call_id", "")
            entry["name"] = msg.get("name", "")
            entry["content"] = str(msg.get("content") or "{}")
        else:
            entry["content"] = msg.get("content") or ""

        clean.append(entry)
    return clean


def get_windowed_messages(history: list[dict], max_turns: int = 10) -> list[dict]:
    window = history[-max_turns:] if len(history) > max_turns else history[:]

    # Drop leading orphaned tool messages
    while window and window[0].get("role") == "tool":
        window.pop(0)

    # Drop trailing assistant calls missing tool replies within this slice
    if (
        window
        and window[-1].get("role") == "assistant"
        and window[-1].get("tool_calls")
    ):
        window.pop()

    return [{"role": "system", "content": SYSTEM_PROMPT}] + window


@router.post("/api/chat")
async def chat(payload: dict):
    session_id = payload["session_id"]
    user_message = payload["message"]

    # 1. Load session and record user message
    state = await load_session(session_id)
    if "messages" not in state:
        state["messages"] = []
    if "shopping_intent" not in state:
        state["shopping_intent"] = {}

    state["messages"].append({"role": "user", "content": user_message})

    # ISOLATION TEST
    #state['messages'] = [{'role': 'user', 'content': user_message}]

    actions = []
    reply_text = ""
    MAX_TOOL_ITERATIONS = 3

    # 2. Agent Execution Loop
    for _ in range(MAX_TOOL_ITERATIONS):
        windowed = get_windowed_messages(state["messages"], max_turns=10)
        sanitized_messages = sanitize_messages_for_llm(windowed)

        response = None
        for attempt in range(2):
            try:
                response = await llm_client.chat(
                    messages=sanitized_messages,
                    tools=get_groq_tool_schemas(),
                )
                break
            except openai.RateLimitError:
                if attempt == 0:
                    logger.warning(
                        "Groq TPM limit reached. Backing off for 1.5s..."
                    )
                    await asyncio.sleep(1.5)
                    continue
                logger.error("Groq rate limit persisted after backoff.")
                reply_text = "I am experiencing high traffic right now. Please try again in a moment."
                break
            except (openai.APITimeoutError, httpx.ReadTimeout):
                logger.error("LLM inference timed out.")
                reply_text = "I'm taking a little longer than usual to think. Could you please rephrase or try again?"
                break
            except openai.APIError as e:
                logger.error(f"OpenAI/Groq API Error: {e}")
                reply_text = "I ran into a temporary issue processing that request. Could you try again?"
                break

        if not response:
            break

        choice = response.choices[0].message

        # Execute tools if requested
        if choice.tool_calls:
            assistant_turn = {
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": call.id,
                        "type": "function",
                        "function": {
                            "name": call.function.name,
                            "arguments": call.function.arguments,
                        },
                    }
                    for call in choice.tool_calls
                ],
            }
            state["messages"].append(assistant_turn)

            for call in choice.tool_calls:
                tool_name = call.function.name
                try:
                    args = json.loads(call.function.arguments)
                except Exception:
                    args = {}

                try:
                    result = await execute_tool(tool_name, args)
                except Exception as e:
                    logger.error(f"Error executing {tool_name}: {e}")
                    result = {"error": f"Failed to execute {tool_name}"}

                actions.append(
                    {"tool": tool_name, "args": args, "result": result}
                )
                merge_intent(state, tool_name, args)

                state["messages"].append(
                    {
                        "role": "tool",
                        "tool_call_id": call.id,
                        "name": tool_name,
                        "content": json.dumps(result),
                    }
                )
        else:
            reply_text = choice.content or ""
            state["messages"].append(
                {"role": "assistant", "content": reply_text}
            )
            break
    else:
        reply_text = "I have updated your items. Let me know what you would like to do next!"
        state["messages"].append({"role": "assistant", "content": reply_text})

    # 3. Save session and return payload
    await save_session(session_id, state)

    return {
        "reply": reply_text,
        "actions": actions,
        "shopping_intent": state.get("shopping_intent", {}),
    }
