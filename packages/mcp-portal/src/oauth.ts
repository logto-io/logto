import { createHash, randomBytes } from 'node:crypto';

import { z } from 'zod';

import { guardedFetch } from './ssrf.js';

/** The protected-resource metadata an MCP server publishes (RFC 9728). */
const protectedResourceMetadata = z.object({
  resource: z.string().optional(),
  authorization_servers: z.array(z.string()).min(1),
});

/** The authorization server metadata (RFC 8414). */
const authorizationServerMetadata = z.object({
  issuer: z.string(),
  authorization_endpoint: z.string().url(),
  token_endpoint: z.string().url(),
  registration_endpoint: z.string().url().optional(),
  code_challenge_methods_supported: z.array(z.string()).optional(),
});

/** The client an authorization server issued through dynamic registration (RFC 7591). */
const registeredClient = z.object({
  client_id: z.string().min(1),
  client_secret: z.string().optional(),
});

export type AuthorizationServerMetadata = z.infer<typeof authorizationServerMetadata>;

/** Looks up the authorization server for an MCP server, from its protected-resource metadata. */
export const discoverAuthorizationServer = async (
  mcpUrl: URL
): Promise<AuthorizationServerMetadata> => {
  const resourceUrl = new URL('/.well-known/oauth-protected-resource', mcpUrl.origin);
  const resource = protectedResourceMetadata.parse(await getJson(resourceUrl));
  const issuer = new URL(resource.authorization_servers[0] ?? '');
  const metadataUrl = new URL('/.well-known/oauth-authorization-server', issuer.origin);

  return authorizationServerMetadata.parse(await getJson(metadataUrl));
};

/** Registers the portal as a client of the authorization server, so no manual setup is needed. */
export const registerClient = async (
  metadata: AuthorizationServerMetadata,
  { redirectUri, clientName }: { redirectUri: string; clientName: string }
) => {
  if (!metadata.registration_endpoint) {
    throw new Error('The authorization server does not support dynamic client registration.');
  }

  const response = await guardedFetch(metadata.registration_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      client_name: clientName,
      redirect_uris: [redirectUri],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    }),
  });

  if (!response.ok) {
    throw new Error(`Client registration failed with status ${response.status}.`);
  }

  return registeredClient.parse(await response.json());
};

/** A PKCE pair: the verifier stays on the server, the challenge goes in the authorization URL. */
export const createPkce = () => {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');

  return { verifier, challenge };
};

/** The URL the user opens to approve access. `state` must be checked when the callback returns. */
export const buildAuthorizationUrl = (
  metadata: AuthorizationServerMetadata,
  {
    clientId,
    redirectUri,
    state,
    codeChallenge,
    resource,
  }: {
    clientId: string;
    redirectUri: string;
    state: string;
    codeChallenge: string;
    resource: string;
  }
) => {
  const url = new URL(metadata.authorization_endpoint);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    resource,
  }).toString();

  return url.toString();
};

const tokenResponse = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  expires_in: z.number().positive().optional(),
  refresh_token: z.string().optional(),
});

export type TokenSet = z.infer<typeof tokenResponse> & { obtainedAt: number };

/** Exchanges the authorization code for tokens, proving possession with the PKCE verifier. */
export const exchangeCode = async (
  metadata: AuthorizationServerMetadata,
  { clientId, redirectUri, code, verifier, resource }: {
    clientId: string;
    redirectUri: string;
    code: string;
    verifier: string;
    resource: string;
  }
): Promise<TokenSet> =>
  postToken(metadata, {
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: verifier,
    resource,
  });

/** Gets a new access token from a stored refresh token. */
export const refreshTokens = async (
  metadata: AuthorizationServerMetadata,
  { clientId, refreshToken, resource }: { clientId: string; refreshToken: string; resource: string }
): Promise<TokenSet> =>
  postToken(metadata, {
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
    resource,
  });

/** Whether a token set still has a usable access token, leaving a minute of margin. */
export const isFresh = (tokens: TokenSet, now = Date.now()) =>
  tokens.expires_in === undefined || now < tokens.obtainedAt + (tokens.expires_in - 60) * 1000;

const postToken = async (metadata: AuthorizationServerMetadata, params: Record<string, string>) => {
  const response = await guardedFetch(metadata.token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams(params).toString(),
  });
  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new Error(`Token request failed with status ${response.status}.`);
  }

  return { ...tokenResponse.parse(body), obtainedAt: Date.now() };
};

const getJson = async (url: URL): Promise<unknown> => {
  const response = await guardedFetch(url, { headers: { accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`Metadata request to ${url.origin} failed with status ${response.status}.`);
  }

  return response.json();
};
