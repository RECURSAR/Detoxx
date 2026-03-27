import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (
      error: FastifyError,
      request: FastifyRequest,
      reply: FastifyReply,
    ): void => {
      request.log.error(
        {
          err: error,
          method: request.method,
          url: request.url,
        },
        "Unhandled error",
      );

      reply.status(500).send({
        error: "InternalServerError",
        message: "An unexpected error occurred.",
      });
    },
  );
}
