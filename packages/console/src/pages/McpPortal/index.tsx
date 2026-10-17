import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import PortalList from './PortalList';
import PortalServers from './PortalServers';
import { type Portal, type PortalsResponse, portalsKey } from './types';

const mcpPortalPathname = '/mcp-portal';

/**
 * The list of portals at /mcp-portal, and one portal's servers at /mcp-portal/:portalId, the same
 * list-then-details shape as Enterprise SSO connections.
 */
function McpPortal() {
  const { portalId } = useParams();
  const { navigate } = useTenantPathname();
  const { data, error } = useSWR<PortalsResponse, RequestError>(portalId ? portalsKey : null);

  if (!portalId) {
    return (
      <PortalList
        onOpen={(portal: Portal) => {
          navigate(`${mcpPortalPathname}/${portal.id}`);
        }}
      />
    );
  }

  const portal = data?.portals.find(({ id }) => id === portalId);

  if (!portal) {
    return error ? null : <p>Loading…</p>;
  }

  return <PortalServers portal={portal} backLink={mcpPortalPathname} />;
}

export default McpPortal;
