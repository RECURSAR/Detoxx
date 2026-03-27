import { App } from "@slack/bolt";

import { config } from "../../config";
import { callPipeline } from "../../services/pipelineClient";
import { fetchSlackContext } from "./slackContextFetcher";
import { normalizeSlackPayload } from "./slackPayloadNormalizer";

const slackApp = new App({
  token: config.slackBotToken,
  signingSecret: config.slackSigningSecret,
  socketMode: false,
});

let initialized = false;

function registerSlackListeners(): void {
  if (initialized) {
    return;
  }

  slackApp.message(async ({ message, say }: { message: unknown; say: (args: { text: string }) => Promise<unknown> }) => {
    const event = message as Record<string, unknown>;
    const channelId = typeof event.channel === "string" ? event.channel : "";

    if (!channelId) {
      return;
    }

    const history = await fetchSlackContext(channelId, 20);
    const unified = normalizeSlackPayload(event, history);
    const rewritten = await callPipeline(unified);

    await say({
      text: rewritten,
    });
  });

  initialized = true;
}

registerSlackListeners();

export async function handleSlackEvent(body: Record<string, unknown>): Promise<void> {
  const event = (body.event as Record<string, unknown> | undefined) ?? body;
  const channelId = typeof event.channel === "string" ? event.channel : "";

  if (!channelId) {
    return;
  }

  const history = await fetchSlackContext(channelId, 20);
  const unified = normalizeSlackPayload(event, history);
  const rewritten = await callPipeline(unified);

  await slackApp.client.chat.postMessage({
    channel: channelId,
    text: rewritten,
  });
}

export async function handleSlackAction(_body: Record<string, unknown>): Promise<void> {
  return;
}
