from __future__ import annotations

from app.api.schemas import MessageHistoryItem


def build_context(history: list[MessageHistoryItem], limit: int = 10) -> list[dict[str, str]]:
    """Convert message history to chat-completion context format."""
    sliced = history[-limit:]
    return [{"role": item.role, "content": item.text} for item in sliced]
