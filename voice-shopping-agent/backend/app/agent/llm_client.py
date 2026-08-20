# backend/app/agent/llm_client.py
from abc import ABC, abstractmethod
from openai import AsyncOpenAI  # Groq is OpenAI-compatible, reuse this SDK
import os
from app.core.config import settings


class LLMClient(ABC):
    @abstractmethod
    async def chat(self, messages: list, tools: list) -> dict:
        ...

class GroqClient(LLMClient):
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        self.model = settings.groq_model

    async def chat(self, messages, tools):
        return await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )