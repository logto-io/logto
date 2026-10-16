export type PortalConfig = {
  port: number;
  /** Logto OIDC issuer, e.g. https://logto.example.com/oidc */
  oidcIssuer: string;
  /** Resource indicator the access token must be issued for. */
  audience: string;
  /** Scope the access token must carry to use the portal. */
  requiredScope: string;
  /** Postgres connection string. When set, upstreams are stored in Postgres instead of the file. */
  databaseUrl?: string;
  /** JSON file that stores registered upstreams when no database is configured. */
  registryPath: string;
};

const required = (env: NodeJS.ProcessEnv, key: string): string => {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): PortalConfig => {
  const port = Number(env.PORTAL_PORT ?? 3100);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORTAL_PORT must be a positive integer');
  }

  return {
    port,
    oidcIssuer: required(env, 'PORTAL_OIDC_ISSUER'),
    audience: required(env, 'PORTAL_AUDIENCE'),
    requiredScope: env.PORTAL_REQUIRED_SCOPE ?? 'mcp:use',
    databaseUrl: env.PORTAL_DATABASE_URL ?? undefined,
    registryPath: env.PORTAL_REGISTRY_PATH ?? 'upstreams.json',
  };
};
