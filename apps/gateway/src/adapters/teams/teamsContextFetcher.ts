import axios from "axios";

import { MessageHistoryItem } from "../../unified/types";

interface TeamsMessage {
  from?: {
    id?: string;
  };
  text?: string;
  createdDateTime?: string;
}

interface TeamsContextResponse {
  value?: TeamsMessage[];
}

export async function fetchTeamsContext(
  channelId: string,
  limit: number,
  accessToken?: string,
): Promise<MessageHistoryItem[]> {
  if (!accessToken) {
    return [];
  }

  const response = await axios.get<TeamsContextResponse>(
    `https://graph.microsoft.com/v1.0/chats/${channelId}/messages`,
    {
      params: {
        $top: limit,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000,
    },
  );

  return (response.data.value ?? [])
    .filter((message: TeamsMessage) => typeof message.text === "string")
    .map((message: TeamsMessage) => ({
      role: (message.from?.id ? "user" : "bot") as "bot" | "user",
      text: message.text ?? "",
      timestamp: message.createdDateTime ?? new Date().toISOString(),
    }))
    .reverse();
}
