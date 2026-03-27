import { buildUnifiedMessage } from "../../unified/messageBuilder";
import { MessageHistoryItem, UnifiedMessage } from "../../unified/types";

interface SlackEvent {
  channel?: string;
  user?: string;
  text?: string;
  ts?: string;
}

export function normalizeSlackPayload(
  event: SlackEvent,
  history: MessageHistoryItem[],
): UnifiedMessage {
  return buildUnifiedMessage({
    messageId: event.ts ?? `${Date.now()}`,
    platform: "slack",
    userId: event.user ?? "unknown-user",
    channelId: event.channel ?? "unknown-channel",
    rawText: event.text ?? "",
    history,
    metadata: {
      source: "slack-event",
    },
  });
}
