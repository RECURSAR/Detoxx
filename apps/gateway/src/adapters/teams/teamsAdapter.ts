import {
  ActivityTypes,
  BotFrameworkAdapter,
  MemoryStorage,
  TurnContext,
} from "botbuilder";

import { config } from "../../config";
import { callPipeline } from "../../services/pipelineClient";
import { fetchTeamsContext } from "./teamsContextFetcher";
import { normalizeTeamsPayload } from "./teamsPayloadNormalizer";

export const teamsAdapter = new BotFrameworkAdapter({
  appId: config.teamsAppId,
  appPassword: config.teamsAppPassword,
});

const memoryStorage = new MemoryStorage();

async function processTurn(turnContext: TurnContext): Promise<void> {
  if (turnContext.activity.type !== ActivityTypes.Message) {
    return;
  }

  const channelId = turnContext.activity.conversation.id;
  const accessToken =
    typeof turnContext.activity.channelData === "object" &&
    turnContext.activity.channelData !== null
      ? (turnContext.activity.channelData as Record<string, unknown>).accessToken
      : undefined;

  const history = await fetchTeamsContext(
    channelId,
    20,
    typeof accessToken === "string" ? accessToken : undefined,
  );
  const unified = normalizeTeamsPayload(turnContext.activity, history);
  const rewritten = await callPipeline(unified);

  await turnContext.sendActivity(rewritten);
}

export async function handleTeamsMessage(body: Record<string, unknown>): Promise<void> {
  const context = new TurnContext(teamsAdapter, body as never);
  await processTurn(context);
}

export { memoryStorage };
