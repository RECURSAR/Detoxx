from __future__ import annotations

from app.config.settings import settings
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.base import LLMProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.openrouter_provider import OpenRouterProvider


def _provider_registry() -> dict[str, LLMProvider]:
    return {
        "openai": OpenAIProvider(),
        "anthropic": AnthropicProvider(),
        "gemini": GeminiProvider(),
        "openrouter": OpenRouterProvider(),
    }


def execute(prompt: list[dict[str, str]], provider_name: str | None = None) -> tuple[str, int]:
    provider_key = provider_name or settings.default_provider
    registry = _provider_registry()

    if provider_key not in registry:
        raise ValueError(f"Unknown provider '{provider_key}'")

    return registry[provider_key].complete(prompt)
