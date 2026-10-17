import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { extractBearerToken } from '@logto/mcp-portal';
import { text } from 'node:stream/consumers';

import { EnvSet } from '#src/env-set/index.js';

import { callLogtoTool, enabledLogtoMcpTools } from './mcp-logto-tools.js';
import type { AnonymousRouter, RouterInitArgs } from './types.js';

// Logto's own MCP endpoint, served on the main Logto host. A request whose host has no portal falls
// through to here (see mcp-portal-endpoint.ts). Tools run with the caller's token, so the
// Management API decides what each caller can read and create.

export const logtoMcpName = 'logto';

/** One MCP server per request, bound to the caller's token and the tenant's Management API. */
export const createLogtoMcpServer = (token: string, apiBase: string): Server => {
  const server = new Server(
    { name: logtoMcpName, version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = enabledLogtoMcpTools(EnvSet.values.isDevFeaturesEnabled).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: {
        type: 'object',
        properties: tool.properties,
        ...(tool.required ? { required: tool.required } : {}),
      },
    }));

    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async ({ params }): Promise<CallToolResult> => {
    const tool = enabledLogtoMcpTools(EnvSet.values.isDevFeaturesEnabled).find(
      ({ name }) => name === params.name
    );

    if (!tool) {
      return { content: [{ type: 'text', text: `Unknown tool "${params.name}"` }], isError: true };
    }

    return callLogtoTool(tool, params.arguments ?? {}, token, apiBase);
  });

  return server;
};

export default function mcpLogtoRoutes<T extends AnonymousRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  // The Management API is served on the same origin as this endpoint, under /api.
  const apiBase = () => `${tenant.envSet.endpoint.origin}/api`;

  // REST wrappers over the same tools, matching Kubo's /api/mcp surface: info, tool schemas, and a
  // call endpoint. Each call is still made with the caller's token, so the Management API decides.
  const bearer = (ctx: { get: (name: string) => string }) => {
    try {
      return extractBearerToken(ctx.get('authorization'));
    } catch {
      return undefined;
    }
  };

  router.get('/mcp/info', async (ctx) => {
    ctx.body = {
      enabled: true,
      authMode: 'bearer token',
      tools: enabledLogtoMcpTools(EnvSet.values.isDevFeaturesEnabled).map(({ name }) => name),
    };
  });

  router.get('/mcp/tools', async (ctx) => {
    ctx.body = {
      tools: enabledLogtoMcpTools(EnvSet.values.isDevFeaturesEnabled).map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: tool.properties,
          ...(tool.required ? { required: tool.required } : {}),
        },
      })),
    };
  });

  router.post('/mcp/call', async (ctx) => {
    const token = bearer(ctx);

    if (!token) {
      ctx.status = 401;
      ctx.body = { error: 'Missing bearer token' };
      return;
    }

    const raw = await text(ctx.req);
    const body = raw ? (JSON.parse(raw) as { name?: unknown; arguments?: unknown }) : {};
    const tool = enabledLogtoMcpTools(EnvSet.values.isDevFeaturesEnabled).find(
      ({ name }) => name === body.name
    );

    if (!tool) {
      ctx.status = 400;
      ctx.body = { error: `Unknown tool "${String(body.name)}"` };
      return;
    }

    const args = typeof body.arguments === 'object' && body.arguments ? body.arguments : {};
    ctx.body = await callLogtoTool(tool, args as Record<string, unknown>, token, apiBase());
  });

  router.all('/mcp', async (ctx, next) => {
    if (ctx.method !== 'POST') {
      // Stateless mode: no server-initiated streams or sessions to resume.
      ctx.status = 405;
      ctx.body = { error: 'Only POST is supported on /mcp' };
      return;
    }

    let token: string;

    try {
      token = extractBearerToken(ctx.get('authorization'));
    } catch {
      ctx.status = 401;
      ctx.set(
        'www-authenticate',
        `Bearer resource_metadata="https://${ctx.host}/.well-known/oauth-protected-resource"`
      );
      ctx.body = { error: 'Missing bearer token' };
      return;
    }

    const raw = await text(ctx.req);
    let body: unknown;

    try {
      body = raw ? (JSON.parse(raw) as unknown) : undefined;
    } catch {
      ctx.status = 400;
      ctx.body = { error: 'Request body is not valid JSON' };
      return;
    }

    const server = createLogtoMcpServer(token, apiBase());
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    // Koa must not write the response; the MCP transport does.
    ctx.respond = false;
    ctx.res.on('close', () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(ctx.req, ctx.res, body);
    return;
  });
}
