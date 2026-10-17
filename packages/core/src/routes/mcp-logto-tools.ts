import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// Tools for managing this Logto tenant over MCP. Each tool is one read-only Management API call,
// made with the caller's own bearer token, so the Management API's checks decide what each caller
// can see. Nothing here writes: creating, changing, and deleting resources stay in the console.

type ToolProperty = { type: 'string' | 'number'; description?: string };

export type LogtoMcpTool = {
  name: string;
  description: string;
  /** The Management API path. `{name}` segments are filled from the tool arguments. */
  path: string;
  properties: Record<string, ToolProperty>;
  required?: string[];
};

const pagingProperties: Record<string, ToolProperty> = {
  page: { type: 'number', description: 'Page number, starting at 1.' },
  page_size: { type: 'number', description: 'Items per page.' },
};

const idProperty: ToolProperty = { type: 'string', description: 'The id of the resource.' };

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
];

/** The paging parameters a list tool passes on to the Management API as query parameters. */
const queryKeys = ['page', 'page_size'] as const;

const pathParameters = (path: string) =>
  [...path.matchAll(/\{(\w+)\}/g)].map(([, key]) => key ?? '');

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

  const path = tool.path.replaceAll(/\{(\w+)\}/g, (_, key: string) =>
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

  const response = await fetchImpl(built.url, {
    headers: { accept: 'application/json', authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.text();

  return { content: [{ type: 'text', text: body }], isError: !response.ok };
};
