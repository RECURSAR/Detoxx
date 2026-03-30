import axios from "axios";

import { config } from "../../config";
import { MessageHistoryItem } from "../../unified/types";

interface SlackHistoryMessage {
  text?: string;
  ts?: string;
  bot_id?: string;
}

interface SlackHistoryResponse {
  ok: boolean;
  messages?: SlackHistoryMessage[];
}

export async function fetchSlackContext(
  channelId: string,
  limit: number,
): Promise<MessageHistoryItem[]> {
  const response = await axios.get<SlackHistoryResponse>(
    "https://slack.com/api/conversations.history",
    {
      params: {
        channel: channelId,
        limit,
      },
      headers: {
        Authorization: `Bearer ${config.slackBotToken}`,
      },
      timeout: 10000,
    },
  );

  if (!response.data.ok) {
    throw new Error("Unable to fetch Slack context");
  }

  const messages = response.data.messages ?? [];

  return messages
    .filter(
      (item: SlackHistoryMessage) =>
        typeof item.text === "string" && typeof item.ts === "string",
    )
    .map((item: SlackHistoryMessage) => ({
      role: (item.bot_id ? "bot" : "user") as "bot" | "user",
      text: item.text as string,
      timestamp: item.ts as string,
    }))
    .reverse();
}
