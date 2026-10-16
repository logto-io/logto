import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

const McpPortal = safeLazy(async () => import('@/pages/McpPortal'));

// Lets the signed-in admin manage their MCP portal upstreams, proxied by Logto core.
export const mcpPortal: RouteObject = {
  path: 'mcp-portal',
  element: <McpPortal />,
};
