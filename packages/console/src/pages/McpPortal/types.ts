export type Upstream = {
  name: string;
  url: string;
  createdAt: string;
  /** Off turns the whole server off for everyone using the portal. */
  enabled?: boolean;
  disabledTools?: string[];
  /** Organizations that can see this server. Empty means everyone the portal admits. */
  organizationIds?: string[];
  /** Whether an admin has stored a bearer token for this server. The token is never returned. */
  hasCredential?: boolean;
};

export type UpstreamsResponse = {
  upstreams: Upstream[];
};

/** A portal is a hostname with its own server list. Each one is served at https://<hostname>/mcp. */
export type Portal = {
  id: string;
  name: string;
  hostname: string;
  createdAt: string;
  /** Members of these organizations can use the portal. Empty means nobody can. */
  organizationIds: string[];
};

export type PortalsResponse = {
  portals: Portal[];
};

export type ToolsResponse = {
  tools: Array<{ name: string; description: string; enabled: boolean }>;
};

export const portalsKey = 'api/mcp-portal/portals';
export const settingsKey = 'api/mcp-portal/settings';

/** The domain portal hostnames are created under. Unset until an admin sets it. */
export type PortalSettings = {
  baseDomain?: string;
};
export const listKeyFor = (portalId: string) =>
  `${portalsKey}/${encodeURIComponent(portalId)}/upstreams`;

/** The organizations the signed-in admin can grant to portals and servers. */
export const organizationsKey = 'api/organizations?page_size=100';
