import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import InfraShell from '@/pages/Kubo/InfraShell';

const McpPortal = safeLazy(async () => import('@/pages/McpPortal'));

const mcpPortalElement = (
  // Wrapped like the other Infrastructure pages so it gets the MeshX tokens and fonts.
  <InfraShell>
    <McpPortal />
  </InfraShell>
);

// The portal list.
export const mcpPortal: RouteObject = {
  path: 'mcp-portal',
  element: mcpPortalElement,
};

// One portal's servers, as a details page like Enterprise SSO connections.
export const mcpPortalDetails: RouteObject = {
  path: 'mcp-portal/:portalId',
  element: mcpPortalElement,
};
