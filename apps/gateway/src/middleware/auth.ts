import { FastifyReply, FastifyRequest } from "fastify";

import { config } from "../config";

function hasValidSlackSignature(request: FastifyRequest): boolean {
  const signature = request.headers["x-slack-signature"];
  return typeof signature === "string" && signature.includes(config.slackSigningSecret);
}

function hasValidTeamsToken(request: FastifyRequest): boolean {
  const authorization = request.headers.authorization;
  return (
    typeof authorization === "string" &&
    authorization.startsWith("Bearer ") &&
    authorization.length > "Bearer ".length
  );
}

export async function platformAuthPreHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const path = request.routeOptions.url ?? request.url;

  if (path.startsWith("/slack") && !hasValidSlackSignature(request)) {
    reply.code(401).send({ error: "Unauthorized Slack request" });
    return;
  }

  if (path.startsWith("/teams") && !hasValidTeamsToken(request)) {
    reply.code(401).send({ error: "Unauthorized Teams request" });
  }
}
