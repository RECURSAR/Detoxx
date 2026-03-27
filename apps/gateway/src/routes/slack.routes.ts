import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { handleSlackAction, handleSlackEvent } from "../adapters/slack/slackAdapter";

export async function slackRoutes(
  app: FastifyInstance,
  _options: FastifyPluginOptions,
): Promise<void> {
  app.post("/slack/events", async (request: FastifyRequest, reply: FastifyReply) => {
    await handleSlackEvent(request.body as Record<string, unknown>);
    reply.code(200).send({ ok: true });
  });

  app.post("/slack/actions", async (request: FastifyRequest, reply: FastifyReply) => {
    await handleSlackAction(request.body as Record<string, unknown>);
    reply.code(200).send({ ok: true });
  });
}
