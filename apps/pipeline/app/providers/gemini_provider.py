from __future__ import annotations

import google.generativeai as genai

from app.config.settings import settings
from app.providers.base import LLMProvider


class GeminiProvider(LLMProvider):
    def __init__(self) -> None:
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        genai.configure(api_key=settings.gemini_api_key)
        self._model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    def complete(self, messages: list[dict[str, str]]) -> tuple[str, int]:
        rendered = "\n".join(f"{m['role']}: {m['content']}" for m in messages)
        response = self._model.generate_content(rendered)
        text = response.text or ""
        tokens = 0
        usage = getattr(response, "usage_metadata", None)
        if usage is not None and hasattr(usage, "total_token_count"):
            tokens = int(usage.total_token_count)
        return text.strip(), tokens
