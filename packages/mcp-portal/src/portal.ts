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
  /**
   * Returns the upstream's decrypted bearer token, or undefined when it has none. Called right before
   * each connection, so the token only exists in memory while a request needs it.
   */
  unlock: (upstream: Upstream) => Promise<string | undefined>;
};

const errorResult = (message: string): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text: message }],
});

const errorReason = (error: unknown) => (error instanceof Error ? error.message : 'unknown error');

/**
 * Builds the MCP server for one portal and one caller. It lists and calls only the portal's upstreams.
 * Tools are exposed as `<upstream>__<tool>`.
 */
export const createPortalServer = (
  portalId: string,
  sub: string,
  organizationIds: string[],
  deps: PortalDeps
): Server => {
  const server = new Server(
    { name: 'logto-mcp-portal', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  const listUpstreamTools = async (upstream: Upstream): Promise<Tool[]> => {
    const startedAt = Date.now();

    try {
      const client = await deps.pool.get(upstream, await deps.unlock(upstream));
      const { tools } = await client.listTools();

      deps.audit({
        action: 'tool.list',
        sub,
        upstream: upstream.name,
        outcome: 'ok',
        durationMs: Date.now() - startedAt,
      });

      return tools
        .filter((tool) => !upstream.disabledTools.includes(tool.name))
        .map((tool) => ({
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

  // A server with no organization list is open to everyone the portal admits. Otherwise the caller
  // must belong to one of the listed organizations, and the server is hidden from everyone else.
  const canSee = (upstream: Upstream) =>
    upstream.organizationIds.length === 0 ||
    upstream.organizationIds.some((id) => organizationIds.includes(id));

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const upstreams = await deps.registry.listForPortal(portalId);
    const perUpstream = await Promise.all(
      upstreams
        .filter((upstream) => upstream.enabled && canSee(upstream))
        .map(async (upstream) => listUpstreamTools(upstream))
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
    const found = await deps.registry.findForPortal(portalId, upstreamName);
    // A server the caller cannot see is reported as unknown, so its existence is not revealed.
    const upstream = found && canSee(found) ? found : undefined;

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

    // Switched-off servers and tools are denied even when a client still has the old tool list.
    if (!upstream.enabled || upstream.disabledTools.includes(toolName)) {
      deps.audit({
        action: 'tool.call',
        sub,
        upstream: upstreamName,
        tool: toolName,
        outcome: 'denied',
        reason: upstream.enabled ? 'tool_disabled' : 'upstream_disabled',
      });
      return errorResult(`Tool "${upstreamName}${toolSeparator}${toolName}" is turned off`);
    }

    const startedAt = Date.now();

    try {
      const client = await deps.pool.get(upstream, await deps.unlock(upstream));
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
