import { describe, expect, it, vi } from 'vitest';

import { createOrganizationLookup } from './organizations.js';

const issuer = 'https://logto.example.com/oidc';
const userinfo = 'https://logto.example.com/oidc/me';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Answers discovery with the userinfo endpoint, and userinfo with the given body. */
const makeFetch = (userinfoResponse: () => Response) =>
  vi.fn<typeof globalThis.fetch>(async (url) => {
    if (String(url).endsWith('/.well-known/openid-configuration')) {
      return jsonResponse(200, { userinfo_endpoint: userinfo });
    }

    return userinfoResponse();
  });

describe('createOrganizationLookup', () => {
  it('returns the organizations claim from userinfo, sent with the caller token', async () => {
    const fetch = makeFetch(() => jsonResponse(200, { sub: 'alice', organizations: ['org-a'] }));
    const lookup = createOrganizationLookup({ issuer, fetch });

    expect(await lookup('token-1')).toEqual(['org-a']);
    const [url, init] = fetch.mock.calls[1] ?? [];
    expect(url).toBe(userinfo);
    expect(init?.headers).toMatchObject({ authorization: 'Bearer token-1' });
  });

  it('returns an empty list when the token has no organizations claim', async () => {
    const fetch = makeFetch(() => jsonResponse(200, { sub: 'alice' }));

    expect(await createOrganizationLookup({ issuer, fetch })('token-1')).toEqual([]);
  });

  it('reuses an answer until it expires', async () => {
    const now = vi.fn(() => 0);
    const fetch = makeFetch(() => jsonResponse(200, { organizations: ['org-a'] }));
    const lookup = createOrganizationLookup({ issuer, fetch, ttlMs: 1000, now });

    await lookup('token-1');
    await lookup('token-1');
    expect(fetch).toHaveBeenCalledTimes(2); // Discovery + one userinfo call

    now.mockReturnValue(1001);
    await lookup('token-1');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('throws when userinfo rejects the token, so access is denied', async () => {
    const fetch = makeFetch(() => jsonResponse(401, { error: 'invalid_token' }));

    await expect(createOrganizationLookup({ issuer, fetch })('bad')).rejects.toThrow(
      'Userinfo returned 401'
    );
  });

  it('retries discovery after it fails', async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockImplementation(async () => jsonResponse(200, { userinfo_endpoint: userinfo }));
    const lookup = createOrganizationLookup({
      issuer,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    await expect(lookup('token-1')).rejects.toThrow('network down');
    // The second call discovers again instead of reusing the failure.
    await expect(lookup('token-1')).resolves.toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
