import { isIP } from 'node:net';

import { createMockUtils } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const lookup = jest.fn();
const post = jest.fn();

class MockHTTPError extends Error {
  constructor(
    public readonly response: Response,
    public readonly request: Request,
    public readonly options: unknown
  ) {
    super('HTTPError');
  }
}

mockEsm('node:dns/promises', () => ({ lookup }));
mockEsm('ky', () => ({
  default: { post },
  HTTPError: MockHTTPError,
}));

const { assertSafeOutboundRequestUrl, safeKyPost } = await import('./outbound-request.js');

const setAllowPrivateOutboundRequests = (value: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for outbound request tests.
  (EnvSet.values as { allowPrivateOutboundRequests: boolean }).allowPrivateOutboundRequests = value;
};

const setResolvedAddresses = (addressesByHost: Record<string, string[]>) => {
  lookup.mockImplementation(async (hostname: string) =>
    (addressesByHost[hostname] ?? []).map((address) => ({
      address,
      family: isIP(address),
    }))
  );
};

describe('assertSafeOutboundRequestUrl', () => {
  const originalAllowPrivateOutboundRequests = EnvSet.values.allowPrivateOutboundRequests;

  beforeEach(() => {
    setAllowPrivateOutboundRequests(false);
    setResolvedAddresses({
      'example.com': ['93.184.216.34'],
      'internal.example.com': ['10.0.0.1'],
      'redirect.example.com': ['93.184.216.34'],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAllowPrivateOutboundRequests(originalAllowPrivateOutboundRequests);
  });

  it('allows public HTTP and HTTPS endpoints', async () => {
    await expect(
      assertSafeOutboundRequestUrl('https://example.com/webhook')
    ).resolves.toBeUndefined();
    await expect(
      assertSafeOutboundRequestUrl('http://example.com/webhook')
    ).resolves.toBeUndefined();
  });

  it('rejects non-HTTP(S) endpoints', async () => {
    await expect(assertSafeOutboundRequestUrl('file:///tmp/payload')).rejects.toMatchError(
      new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 })
    );
  });

  it('rejects invalid endpoint URLs', async () => {
    await expect(assertSafeOutboundRequestUrl('not_work_url')).rejects.toMatchError(
      new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 })
    );
  });

  it('rejects endpoints that can not be resolved', async () => {
    lookup.mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND missing.example.com'));

    await expect(
      assertSafeOutboundRequestUrl('https://missing.example.com/webhook')
    ).rejects.toMatchError(new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 }));
  });

  it.each([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://10.0.0.1',
    'http://172.16.0.1',
    'http://192.168.1.1',
    'http://[::1]',
    'http://[fe80::1]',
  ])('rejects private endpoint %s by default', async (url) => {
    await expect(assertSafeOutboundRequestUrl(url)).rejects.toMatchError(
      new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 })
    );
  });

  it('rejects hosts that resolve to private addresses by default', async () => {
    await expect(
      assertSafeOutboundRequestUrl('https://internal.example.com/webhook')
    ).rejects.toMatchError(new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 }));
  });

  it('allows private addresses when ALLOW_PRIVATE_OUTBOUND_REQUESTS is enabled', async () => {
    setAllowPrivateOutboundRequests(true);

    await expect(
      assertSafeOutboundRequestUrl('https://internal.example.com/webhook')
    ).resolves.toBeUndefined();
    await expect(assertSafeOutboundRequestUrl('http://10.0.0.1')).resolves.toBeUndefined();
  });

  it('always rejects metadata endpoints', async () => {
    setAllowPrivateOutboundRequests(true);

    await expect(
      assertSafeOutboundRequestUrl('http://169.254.169.254/latest/meta-data')
    ).rejects.toMatchError(new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 }));
    await expect(
      assertSafeOutboundRequestUrl('http://[fd00:ec2::254]/latest/meta-data')
    ).rejects.toMatchError(new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 }));
  });
});

describe('safeKyPost', () => {
  beforeEach(() => {
    setAllowPrivateOutboundRequests(false);
    setResolvedAddresses({
      'example.com': ['93.184.216.34'],
      'redirect.example.com': ['93.184.216.34'],
      'internal.example.com': ['10.0.0.1'],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('follows redirects to public endpoints', async () => {
    post
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: 'https://redirect.example.com/webhook' },
        })
      )
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    await expect(safeKyPost('https://example.com/webhook')).resolves.toHaveProperty('status', 200);
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('rejects redirects to private endpoints', async () => {
    post.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: 'https://internal.example.com/webhook' },
      })
    );

    await expect(safeKyPost('https://example.com/webhook')).rejects.toMatchError(
      new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 })
    );
  });

  it('rejects redirects to metadata endpoints even when private outbound requests are allowed', async () => {
    setAllowPrivateOutboundRequests(true);
    post.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: 'http://169.254.169.254/latest/meta-data' },
      })
    );

    await expect(safeKyPost('https://example.com/webhook')).rejects.toMatchError(
      new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 })
    );
  });
});
