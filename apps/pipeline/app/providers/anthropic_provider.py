from __future__ import annotations

import anthropic

from app.config.settings import settings
from app.providers.base import LLMProvider


class AnthropicProvider(LLMProvider):
    def __init__(self) -> None:
        if not settings.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY is not configured")
        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def complete(self, messages: list[dict[str, str]]) -> tuple[str, int]:
        system = next((m["content"] for m in messages if m["role"] == "system"), "")
        non_system = [m for m in messages if m["role"] != "system"]

        response = self._client.messages.create(
            model="claude-3-5-haiku-latest",
            max_tokens=512,
            system=system,
            messages=non_system,
        )

        text = "".join(block.text for block in response.content if hasattr(block, "text"))
        tokens = (response.usage.input_tokens + response.usage.output_tokens) if response.usage else 0
        return text.strip(), int(tokens)
