import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { handleTeamsMessage } from "../adapters/teams/teamsAdapter";

export async function teamsRoutes(
  app: FastifyInstance,
  _options: FastifyPluginOptions,
): Promise<void> {
  app.post("/teams/messages", async (request: FastifyRequest, reply: FastifyReply) => {
    await handleTeamsMessage(request.body as Record<string, unknown>);
    reply.code(200).send({ ok: true });
  });
}
