from __future__ import annotations

import httpx

from app.config.settings import settings
from app.providers.base import LLMProvider


class OpenRouterProvider(LLMProvider):
    def __init__(self) -> None:
        if not settings.openrouter_api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")
        self._api_key = settings.openrouter_api_key

    def complete(self, messages: list[dict[str, str]]) -> tuple[str, int]:
        payload = {
            "model": "openai/gpt-4o-mini",
            "messages": messages,
            "temperature": 0.2,
        }
        with httpx.Client(timeout=20.0) as client:
            response = client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        tokens = int(data.get("usage", {}).get("total_tokens", 0))
        return str(content).strip(), tokens
