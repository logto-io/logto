import { FastifyInstance } from "fastify";
export default async function healthCheck(app: FastifyInstance) {
  app.get("/health", async () => {
    return { status: "ok" };
  });
}
