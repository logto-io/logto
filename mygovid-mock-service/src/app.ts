import fastify, { FastifyServerOptions } from "fastify";
import routes from "./routes/index.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import sensible from "@fastify/sensible";

export async function build(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

  app.register(import("@fastify/cookie"), {
    hook: "onRequest", // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: {}, // options for parsing cookies
  });

  app.register(import("@fastify/formbody"));

  app.register(routes);

  app.register(sensible);

  return app;
}
