# backend/app/routers/chat.py
from fastapi import APIRouter
import json
from app.agent.tool_registry import get_groq_tool_schemas
from app.agent.dispatcher import execute_tool
from app.agent.llm_client import GroqClient

router = APIRouter()
llm_client = GroqClient()

SYSTEM_PROMPT = """You are a shopping assistant for an online fashion store.
Use tools to search products or check available filter options.
Don't ask for information the customer already gave you.
Keep replies short and natural."""

@router.post("/api/chat")
async def chat(payload: dict):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": payload["message"]},
    ]

    response = await llm_client.chat(messages=messages, tools=get_groq_tool_schemas())
    choice = response.choices[0].message
    actions = []

    if choice.tool_calls:
        messages.append(choice.model_dump(exclude_none=True))

        for call in choice.tool_calls:
            args = json.loads(call.function.arguments)
            result = await execute_tool(call.function.name, args)
            actions.append({"tool": call.function.name, "args": args, "result": result})

            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result),
            })

        final = await llm_client.chat(messages=messages, tools=get_groq_tool_schemas())  # ← fixed
        reply_text = final.choices[0].message.content
    else:
        reply_text = choice.content

    return {"reply": reply_text, "actions": actions}