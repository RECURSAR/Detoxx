from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class MessageHistoryItem(BaseModel):
    role: Literal["user", "bot"]
    text: str
    timestamp: str


class UnifiedMessage(BaseModel):
    message_id: str = Field(alias="messageId")
    platform: Literal["slack", "teams"]
    user_id: str = Field(alias="userId")
    channel_id: str = Field(alias="channelId")
    raw_text: str = Field(alias="rawText")
    history: list[MessageHistoryItem]
    metadata: dict[str, Any]


class RewriteRequest(BaseModel):
    message: UnifiedMessage
    tone_preset: str = "default"


class RewriteResponse(BaseModel):
    rewritten_text: str
    provider_used: str
    tokens_used: int
