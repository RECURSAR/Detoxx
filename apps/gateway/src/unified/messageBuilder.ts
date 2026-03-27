import { MessageHistoryItem, SupportedPlatform, UnifiedMessage } from "./types";

export interface UnifiedMessageInput {
  messageId: string;
  platform: SupportedPlatform;
  userId: string;
  channelId: string;
  rawText: string;
  history?: MessageHistoryItem[];
  metadata?: Record<string, unknown>;
}

function assertNonEmpty(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${field}: expected non-empty string`);
  }
}

function isHistoryItem(value: unknown): value is MessageHistoryItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as MessageHistoryItem;
  return (
    (candidate.role === "user" || candidate.role === "bot") &&
    typeof candidate.text === "string" &&
    typeof candidate.timestamp === "string"
  );
}

export function buildUnifiedMessage(input: UnifiedMessageInput): UnifiedMessage {
  assertNonEmpty(input.messageId, "messageId");
  assertNonEmpty(input.userId, "userId");
  assertNonEmpty(input.channelId, "channelId");
  assertNonEmpty(input.rawText, "rawText");

  if (input.platform !== "slack" && input.platform !== "teams") {
    throw new Error("Invalid platform: expected slack or teams");
  }

  const history = (input.history ?? []).filter(isHistoryItem);

  return {
    messageId: input.messageId,
    platform: input.platform,
    userId: input.userId,
    channelId: input.channelId,
    rawText: input.rawText.trim(),
    history,
    metadata: input.metadata ?? {},
  };
}
