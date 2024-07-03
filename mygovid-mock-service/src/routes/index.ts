import { FastifyInstance } from "fastify";
import healthCheck from "./healthcheck.js";
import logto from "./logto/index.js";

export default async function routes(app: FastifyInstance) {
  app.register(healthCheck);
  app.register(logto, { prefix: "/logto/mock" });
}
