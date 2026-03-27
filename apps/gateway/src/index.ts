import Fastify from "fastify";

import { config } from "./config";
import { platformAuthPreHandler } from "./middleware/auth";
import { registerErrorHandler } from "./middleware/errorHandler";
import { slackRoutes } from "./routes/slack.routes";
import { teamsRoutes } from "./routes/teams.routes";

async function bootstrap(): Promise<void> {
  const app = Fastify({
    logger: true,
  });

  app.addHook("preHandler", platformAuthPreHandler);
  registerErrorHandler(app);

  app.register(slackRoutes);
  app.register(teamsRoutes);

  await app.listen({
    host: "0.0.0.0",
    port: config.port,
  });
}

void bootstrap();
