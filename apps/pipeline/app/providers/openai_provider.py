from __future__ import annotations

from openai import OpenAI

from app.config.settings import settings
from app.providers.base import LLMProvider


class OpenAIProvider(LLMProvider):
    def __init__(self) -> None:
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not configured")
        self._client = OpenAI(api_key=settings.openai_api_key)

    def complete(self, messages: list[dict[str, str]]) -> tuple[str, int]:
        response = self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.2,
        )
        content = response.choices[0].message.content or ""
        tokens = response.usage.total_tokens if response.usage else 0
        return content.strip(), int(tokens)
