import { buildUnifiedMessage } from "../../unified/messageBuilder";
import { MessageHistoryItem, UnifiedMessage } from "../../unified/types";

interface TeamsActivity {
  id?: string;
  text?: string;
  channelId?: string;
  from?: {
    id?: string;
  };
}

export function normalizeTeamsPayload(
  activity: TeamsActivity,
  history: MessageHistoryItem[],
): UnifiedMessage {
  return buildUnifiedMessage({
    messageId: activity.id ?? `${Date.now()}`,
    platform: "teams",
    userId: activity.from?.id ?? "unknown-user",
    channelId: activity.channelId ?? "unknown-channel",
    rawText: activity.text ?? "",
    history,
    metadata: {
      source: "teams-activity",
    },
  });
}
