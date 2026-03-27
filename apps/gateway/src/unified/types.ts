export type SupportedPlatform = "slack" | "teams";

export interface MessageHistoryItem {
  role: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface UnifiedMessage {
  messageId: string;
  platform: SupportedPlatform;
  userId: string;
  channelId: string;
  rawText: string;
  history: MessageHistoryItem[];
  metadata: Record<string, unknown>;
}

export interface PipelineRequest {
  message: UnifiedMessage;
  tone_preset?: string;
}
