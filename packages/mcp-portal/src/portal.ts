import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { type AuditEvent } from './audit.js';
import { type Upstream, type UpstreamStore } from './registry.js';
import { type UpstreamPool } from './upstream-pool.js';

export const toolSeparator = '__';

type PortalDeps = {
  registry: UpstreamStore;
  pool: UpstreamPool;
  audit: (event: AuditEvent) => void;
};

const errorResult = (message: string): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text: message }],
});

const errorReason = (error: unknown) => (error instanceof Error ? error.message : 'unknown error');

/**
 * Builds an MCP server scoped to one caller. It lists and calls only that caller's upstreams.
 * Tools are exposed as `<upstream>__<tool>`.
 */
export const createPortalServer = (sub: string, deps: PortalDeps): Server => {
  const server = new Server(
    { name: 'logto-mcp-portal', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  const listUpstreamTools = async (upstream: Upstream): Promise<Tool[]> => {
    const startedAt = Date.now();

    try {
      const client = await deps.pool.get(upstream);
      const { tools } = await client.listTools();

      deps.audit({
        action: 'tool.list',
        sub,
        upstream: upstream.name,
        outcome: 'ok',
        durationMs: Date.now() - startedAt,
      });

      return tools.map((tool) => ({
        ...tool,
        name: `${upstream.name}${toolSeparator}${tool.name}`,
        description: tool.description ?? `From upstream "${upstream.name}"`,
      }));
    } catch (error: unknown) {
      // One unreachable upstream must not hide the others.
      await deps.pool.invalidate(upstream);
      deps.audit({
        action: 'tool.list',
        sub,
        upstream: upstream.name,
        outcome: 'error',
        durationMs: Date.now() - startedAt,
        reason: errorReason(error),
      });

      return [];
    }
  };

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const upstreams = await deps.registry.listForOwner(sub);
    const perUpstream = await Promise.all(
      upstreams.map(async (upstream) => listUpstreamTools(upstream))
    );

    return { tools: perUpstream.flat() };
  });

  server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
    const separatorIndex = params.name.indexOf(toolSeparator);

    if (separatorIndex <= 0) {
      return errorResult('Tool name must be <upstream>__<tool>');
    }

    const upstreamName = params.name.slice(0, separatorIndex);
    const toolName = params.name.slice(separatorIndex + toolSeparator.length);
    const upstream = await deps.registry.findForOwner(sub, upstreamName);

    if (!upstream) {
      deps.audit({
        action: 'tool.call',
        sub,
        upstream: upstreamName,
        tool: toolName,
        outcome: 'denied',
      });
      return errorResult(`Unknown upstream "${upstreamName}"`);
    }

    const startedAt = Date.now();

    try {
      const client = await deps.pool.get(upstream);
      const result = await client.callTool({
        name: toolName,
        arguments: params.arguments ?? {},
      });

      deps.audit({
        action: 'tool.call',
        sub,
        upstream: upstreamName,
        tool: toolName,
        outcome: 'ok',
        durationMs: Date.now() - startedAt,
      });

      return result;
    } catch (error: unknown) {
      await deps.pool.invalidate(upstream);
      deps.audit({
        action: 'tool.call',
        sub,
        upstream: upstreamName,
        tool: toolName,
        outcome: 'error',
        durationMs: Date.now() - startedAt,
        reason: errorReason(error),
      });

      return errorResult(`Upstream "${upstreamName}" failed to handle the call`);
    }
  });

  return server;
};
