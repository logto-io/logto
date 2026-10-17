/* eslint-disable @silverhand/fp/no-mutating-methods, @silverhand/fp/no-let, @silverhand/fp/no-mutation -- the test stubs record calls and build a redirect table */
import { describe, expect, it, vi } from 'vitest';

import { UpstreamUrlError, assertPublicHttpsUrl, guardedFetch } from './ssrf.js';

describe('assertPublicHttpsUrl', () => {
  it('accepts a public https URL given as an IP literal', async () => {
    await expect(assertPublicHttpsUrl('https://93.184.216.34/mcp')).resolves.toBeInstanceOf(URL);
  });

  it.each([
    ['plain http', 'http://93.184.216.34/mcp'],
    ['a non-URL', 'not a url'],
    ['embedded credentials', 'https://user:pass@93.184.216.34/mcp'],
  ])('rejects %s', async (_label, url) => {
    await expect(assertPublicHttpsUrl(url)).rejects.toBeInstanceOf(UpstreamUrlError);
  });

  it.each([
    ['loopback', 'https://127.0.0.1/mcp'],
    ['private 10/8', 'https://10.0.0.5/mcp'],
    ['private 192.168/16', 'https://192.168.1.10/mcp'],
    ['private 172.16/12', 'https://172.20.0.1/mcp'],
    ['cloud metadata link-local', 'https://169.254.169.254/latest'],
    ['carrier-grade NAT', 'https://100.100.1.1/mcp'],
    ['IPv6 loopback', 'https://[::1]/mcp'],
    ['IPv6 unique local', 'https://[fd00::1]/mcp'],
    ['IPv4-mapped loopback', 'https://[::ffff:127.0.0.1]/mcp'],
  ])('rejects %s', async (_label, url) => {
    await expect(assertPublicHttpsUrl(url)).rejects.toThrow('private address');
  });

  it('rejects a hostname that resolves to a private address', async () => {
    await expect(assertPublicHttpsUrl('https://localhost/mcp')).rejects.toBeInstanceOf(
      UpstreamUrlError
    );
  });
});

/** A fetch stub that answers each URL from a table, and records which URLs were requested. */
const stubFetch = (answers: Record<string, Response>) => {
  const requested: string[] = [];
  const fetchImpl = vi.fn(async (input: string | URL | Request) => {
    const url = input.toString();
    requested.push(url);
    const answer = answers[url];

    if (!answer) {
      throw new Error(`unexpected request to ${url}`);
    }

    return answer;
  });

  return { fetchImpl: fetchImpl as unknown as typeof fetch, requested };
};

const redirect = (location: string) => new Response(null, { status: 302, headers: { location } });

describe('guardedFetch', () => {
  it('returns a response that is not a redirect', async () => {
    const { fetchImpl } = stubFetch({
      'https://93.184.216.34/mcp': new Response('ok', { status: 200 }),
    });

    const response = await guardedFetch('https://93.184.216.34/mcp', {}, fetchImpl);

    expect(response.status).toBe(200);
  });

  it('follows a redirect to another public address, checking it first', async () => {
    const { fetchImpl, requested } = stubFetch({
      'https://93.184.216.34/mcp': redirect('https://1.1.1.1/mcp'),
      'https://1.1.1.1/mcp': new Response('ok', { status: 200 }),
    });

    const response = await guardedFetch('https://93.184.216.34/mcp', {}, fetchImpl);

    expect(response.status).toBe(200);
    expect(requested).toEqual(['https://93.184.216.34/mcp', 'https://1.1.1.1/mcp']);
  });

  it('refuses a redirect to a private address without requesting it', async () => {
    const { fetchImpl, requested } = stubFetch({
      'https://93.184.216.34/mcp': redirect('https://169.254.169.254/latest/meta-data'),
    });

    await expect(guardedFetch('https://93.184.216.34/mcp', {}, fetchImpl)).rejects.toBeInstanceOf(
      UpstreamUrlError
    );
    expect(requested).toEqual(['https://93.184.216.34/mcp']);
  });

  it('refuses a redirect to plain http', async () => {
    const { fetchImpl, requested } = stubFetch({
      'https://93.184.216.34/mcp': redirect('http://1.1.1.1/mcp'),
    });

    await expect(guardedFetch('https://93.184.216.34/mcp', {}, fetchImpl)).rejects.toBeInstanceOf(
      UpstreamUrlError
    );
    expect(requested).toEqual(['https://93.184.216.34/mcp']);
  });

  it('resolves a relative redirect against the current address', async () => {
    const { fetchImpl, requested } = stubFetch({
      'https://93.184.216.34/mcp': redirect('/mcp/v2'),
      'https://93.184.216.34/mcp/v2': new Response('ok', { status: 200 }),
    });

    await guardedFetch('https://93.184.216.34/mcp', {}, fetchImpl);

    expect(requested[1]).toBe('https://93.184.216.34/mcp/v2');
  });

  it('keeps the authorization header on a redirect within the same origin', async () => {
    const sent: Array<string | undefined> = [];
    const fetchImpl = vi.fn(async (url: string | URL, init?: RequestInit) => {
      sent.push(new Headers(init?.headers).get('authorization') ?? undefined);

      return String(url).endsWith('/mcp')
        ? redirect('https://93.184.216.34/mcp/v2')
        : new Response('ok', { status: 200 });
    });

    await guardedFetch(
      'https://93.184.216.34/mcp',
      { headers: { authorization: 'Bearer token' } },
      fetchImpl as unknown as typeof fetch
    );

    expect(sent).toEqual(['Bearer token', 'Bearer token']);
  });

  it('drops the authorization header on a redirect to another origin', async () => {
    const sent: Array<string | undefined> = [];
    const fetchImpl = vi.fn(async (url: string | URL, init?: RequestInit) => {
      sent.push(new Headers(init?.headers).get('authorization') ?? undefined);

      return String(url).startsWith('https://93.184.216.34')
        ? redirect('https://1.1.1.1/mcp')
        : new Response('ok', { status: 200 });
    });

    await guardedFetch(
      'https://93.184.216.34/mcp',
      { headers: { authorization: 'Bearer token' } },
      fetchImpl as unknown as typeof fetch
    );

    expect(sent).toEqual(['Bearer token', undefined]);
  });

  it('gives up after too many redirects', async () => {
    const answers: Record<string, Response> = {};

    for (let index = 0; index < 10; index += 1) {
      answers[`https://93.184.216.${index + 1}/mcp`] = redirect(
        `https://93.184.216.${index + 2}/mcp`
      );
    }

    const { fetchImpl } = stubFetch(answers);

    await expect(guardedFetch('https://93.184.216.1/mcp', {}, fetchImpl)).rejects.toThrow(
      'too many times'
    );
  });
});

/* eslint-enable @silverhand/fp/no-mutating-methods, @silverhand/fp/no-let, @silverhand/fp/no-mutation */
