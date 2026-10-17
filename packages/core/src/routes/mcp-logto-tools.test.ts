import { buildLogtoToolUrl, callLogtoTool, logtoMcpTools } from './mcp-logto-tools.js';

const { jest } = import.meta;

/**
 * Covers src/routes/mcp-logto-tools.ts. Requests are checked against a fetch stub, so nothing reaches
 * a real Management API, and the tests show that each call carries the caller's own token.
 */
const apiBase = 'https://auth.example.com/api';

const tool = (name: string) => {
  const found = logtoMcpTools.find((candidate) => candidate.name === name);

  if (!found) {
    throw new Error(`No tool ${name}`);
  }

  return found;
};

describe('buildLogtoToolUrl', () => {
  it('fills the path parameter', () => {
    const built = buildLogtoToolUrl(tool('get_application'), { id: 'app-1' }, apiBase);

    expect(built).toEqual({ url: new URL(`${apiBase}/applications/app-1`) });
  });

  it('passes paging as query parameters', () => {
    const built = buildLogtoToolUrl(tool('list_users'), { page: 2, page_size: 20 }, apiBase);

    expect('url' in built && built.url.searchParams.get('page')).toBe('2');
    expect('url' in built && built.url.searchParams.get('page_size')).toBe('20');
  });

  it('ignores paging values that are not positive integers', () => {
    const built = buildLogtoToolUrl(tool('list_users'), { page: -1, page_size: 1.5 }, apiBase);

    expect('url' in built && [...built.url.searchParams.keys()]).toEqual([]);
  });

  it('refuses a call without the id it needs, before any request is made', () => {
    expect(buildLogtoToolUrl(tool('get_user'), {}, apiBase)).toEqual({
      error: 'Missing argument: id',
    });
  });

  it('encodes an id so it cannot change the path', () => {
    const built = buildLogtoToolUrl(tool('get_user'), { id: '../applications' }, apiBase);

    expect('url' in built && built.url.pathname).toBe('/api/users/..%2Fapplications');
  });
});

describe('callLogtoTool', () => {
  it('forwards the caller’s own token to the Management API', async () => {
    const fetchImpl = jest.fn(async () => new Response('{"id":"app-1"}', { status: 200 }));

    const result = await callLogtoTool(
      tool('get_application'),
      { id: 'app-1' },
      'caller-token',
      apiBase,
      fetchImpl as unknown as typeof fetch
    );

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    expect(String(url)).toBe(`${apiBase}/applications/app-1`);
    expect(init.headers).toMatchObject({ authorization: 'Bearer caller-token' });
    expect(result).toEqual({ content: [{ type: 'text', text: '{"id":"app-1"}' }], isError: false });
  });

  it('reports a refused call as an error result with the Management API body', async () => {
    const fetchImpl = jest.fn(async () => new Response('{"message":"forbidden"}', { status: 403 }));

    const result = await callLogtoTool(
      tool('list_users'),
      {},
      'weak-token',
      apiBase,
      fetchImpl as unknown as typeof fetch
    );

    expect(result).toEqual({
      content: [{ type: 'text', text: '{"message":"forbidden"}' }],
      isError: true,
    });
  });

  it('does not call the Management API when the arguments are missing', async () => {
    const fetchImpl = jest.fn();

    const result = await callLogtoTool(
      tool('get_user'),
      {},
      'caller-token',
      apiBase,
      fetchImpl as unknown as typeof fetch
    );

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
  });
});

describe('logtoMcpTools', () => {
  it('exposes read-only tools only', () => {
    for (const { name } of logtoMcpTools) {
      expect(name).not.toMatch(/^(create|update|delete|remove|set|add)_/);
    }
  });
});
