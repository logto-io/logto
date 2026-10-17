import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// Tools for managing this Logto tenant over MCP. Each tool is one Management API call, made with
// the caller's own bearer token, so the Management API's checks decide what each caller can do.
// Read tools list and fetch resources. Write tools only create resources: changing and deleting
// stay in the console. A write tool builds its JSON body from an explicit list of fields, so an
// argument the tool does not name never reaches the Management API.

type ToolProperty = {
  type: 'string' | 'number' | 'array';
  description?: string;
  enum?: readonly string[];
  items?: { type: 'string' };
};

export type LogtoMcpTool = {
  name: string;
  description: string;
  /** The Management API path. `{name}` segments are filled from the tool arguments. */
  path: string;
  /** Defaults to GET. Write tools use POST and send the body built by `body`. */
  method?: 'GET' | 'POST';
  properties: Record<string, ToolProperty>;
  required?: string[];
  /** Builds the JSON body of a POST tool from its arguments. Only the fields it names are sent. */
  body?: (args: Record<string, unknown>) => Record<string, unknown>;
};

const pagingProperties: Record<string, ToolProperty> = {
  page: { type: 'number', description: 'Page number, starting at 1.' },
  page_size: { type: 'number', description: 'Items per page.' },
};

const idProperty: ToolProperty = { type: 'string', description: 'The id of the resource.' };

const nameProperty: ToolProperty = { type: 'string', description: 'The display name.' };

const descriptionProperty: ToolProperty = {
  type: 'string',
  description: 'An optional description.',
};

const applicationTypes = ['SPA', 'Traditional', 'Native', 'MachineToMachine'] as const;

export const logtoMcpTools: readonly LogtoMcpTool[] = [
  {
    name: 'list_applications',
    description: 'List the applications in this tenant.',
    path: '/applications',
    properties: pagingProperties,
  },
  {
    name: 'get_application',
    description: 'Get one application by id.',
    path: '/applications/{id}',
    properties: { id: idProperty },
    required: ['id'],
  },
  {
    name: 'list_users',
    description: 'List the users in this tenant.',
    path: '/users',
    properties: pagingProperties,
  },
  {
    name: 'get_user',
    description: 'Get one user by id.',
    path: '/users/{id}',
    properties: { id: idProperty },
    required: ['id'],
  },
  {
    name: 'list_organizations',
    description: 'List the organizations in this tenant.',
    path: '/organizations',
    properties: pagingProperties,
  },
  {
    name: 'list_roles',
    description: 'List the roles in this tenant.',
    path: '/roles',
    properties: pagingProperties,
  },
  {
    name: 'list_api_resources',
    description: 'List the API resources in this tenant.',
    path: '/resources',
    properties: pagingProperties,
  },
  {
    name: 'create_application',
    description:
      'Create an application in this tenant. The id and client secret are generated for you and returned in the result.',
    path: '/applications',
    method: 'POST',
    properties: {
      name: nameProperty,
      type: { type: 'string', enum: applicationTypes, description: 'The application type.' },
      description: descriptionProperty,
      redirect_uris: {
        type: 'array',
        items: { type: 'string' },
        description: 'Allowed redirect URIs after sign-in.',
      },
      post_logout_redirect_uris: {
        type: 'array',
        items: { type: 'string' },
        description: 'Allowed redirect URIs after sign-out.',
      },
    },
    required: ['name', 'type'],
    body: (args) => ({
      id: generateStandardId(),
      secret: generateStandardSecret(),
      name: args.name,
      type: args.type,
      description: args.description,
      oidcClientMetadata: {
        redirectUris: args.redirect_uris ?? [],
        postLogoutRedirectUris: args.post_logout_redirect_uris ?? [],
      },
    }),
  },
  {
    name: 'create_api_resource',
    description: 'Create an API resource, the audience that access tokens are issued for.',
    path: '/resources',
    method: 'POST',
    properties: {
      name: nameProperty,
      indicator: {
        type: 'string',
        description: 'The API identifier, usually a URL such as https://api.example.com.',
      },
      access_token_ttl: { type: 'number', description: 'Access token lifetime in seconds.' },
    },
    required: ['name', 'indicator'],
    body: (args) => ({
      name: args.name,
      indicator: args.indicator,
      accessTokenTtl: args.access_token_ttl,
    }),
  },
  {
    name: 'create_organization',
    description: 'Create an organization in this tenant.',
    path: '/organizations',
    method: 'POST',
    properties: { name: nameProperty, description: descriptionProperty },
    required: ['name'],
    body: (args) => ({ name: args.name, description: args.description }),
  },
];

/**
 * The tools a caller can see. Write tools are an in-development surface, so they are only listed
 * and callable while dev features are enabled. Read tools are always available.
 */
export const enabledLogtoMcpTools = (isDevFeaturesEnabled: boolean): readonly LogtoMcpTool[] =>
  logtoMcpTools.filter(({ method }) => method !== 'POST' || isDevFeaturesEnabled);

/** The paging parameters a list tool passes on to the Management API as query parameters. */
const queryKeys = ['page', 'page_size'] as const;

const pathParameters = (path: string) => [...path.matchAll(/{(\w+)}/g)].map(([, key]) => key ?? '');

/** Builds the Management API URL for a tool call, or explains why the arguments do not fit. */
export const buildLogtoToolUrl = (
  tool: LogtoMcpTool,
  args: Record<string, unknown>,
  apiBase: string
): { url: URL } | { error: string } => {
  const missing = pathParameters(tool.path).filter((key) => {
    const value = args[key];
    return typeof value !== 'string' || value.length === 0;
  });

  if (missing.length > 0) {
    return { error: `Missing argument: ${missing.join(', ')}` };
  }

  const path = tool.path.replaceAll(/{(\w+)}/g, (_, key: string) =>
    encodeURIComponent(String(args[key]))
  );
  const url = new URL(`${apiBase}${path}`);

  for (const key of queryKeys) {
    const value = args[key];

    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      url.searchParams.set(key, String(value));
    }
  }

  return { url };
};

/**
 * Runs one tool. The Management API answers with the same status codes it gives the console, and
 * a refused or failed call comes back as an error result rather than a thrown error.
 */
export const callLogtoTool = async (
  tool: LogtoMcpTool,
  args: Record<string, unknown>,
  token: string,
  apiBase: string,
  fetchImpl: typeof fetch = fetch
): Promise<CallToolResult> => {
  const built = buildLogtoToolUrl(tool, args, apiBase);

  if ('error' in built) {
    return { content: [{ type: 'text', text: built.error }], isError: true };
  }

  return sendLogtoRequest(tool, built.url, tool.body?.(args), token, fetchImpl);
};

/**
 * Sends one request with a body that is already built. A confirmed Ask AI write uses this with the
 * body stored when it was proposed, so the request is exactly what the user was shown.
 */
export const sendLogtoRequest = async (
  tool: LogtoMcpTool,
  url: URL,
  requestBody: Record<string, unknown> | undefined,
  token: string,
  fetchImpl: typeof fetch = fetch
): Promise<CallToolResult> => {
  const response = await fetchImpl(url, {
    method: tool.method ?? 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      ...(requestBody ? { 'content-type': 'application/json' } : {}),
    },
    ...(requestBody ? { body: JSON.stringify(requestBody) } : {}),
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.text();

  return { content: [{ type: 'text', text: body }], isError: !response.ok };
};
