import { type Socket } from 'node:net';

import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

import { guardSocket, ssrfProtectedFetch, ssrfProtectedGot } from './outbound-request.js';

const stubSsrfProtection = (isSsrfProtectionEnabled: boolean) => {
  Sinon.stub(EnvSet, 'values').value({
    ...EnvSet.values,
    isSsrfProtectionEnabled,
  });
};

/**
 * Captures the agent `got` resolved for a request, then aborts before any socket is opened, so the
 * assertions stay on configuration instead of real network behavior.
 */
const captureGotAgent = async () => {
  const abort = new Error('aborted by test');
  const captured = new Map<'agent', unknown>();

  await expect(
    ssrfProtectedGot.get('https://example.com/', {
      retry: { limit: 0 },
      hooks: {
        beforeRequest: [
          (options) => {
            captured.set('agent', options.agent);
            throw abort;
          },
        ],
      },
    })
  ).rejects.toThrow(abort.message);

  return captured.get('agent');
};

const dispatcherOf = (init?: RequestInit) =>
  Object.getOwnPropertyDescriptor(init ?? {}, 'dispatcher')?.value;

/** Minimal stand-in for the socket an agent hands back; only the guard's contract is used. */
const createFakeSocket = (remoteAddress: string) => {
  const listeners = new Map<string, () => void>();
  const destroyed = new Map<'error', Error | undefined>();

  return {
    remoteAddress,
    connecting: true,
    once(event: string, listener: () => void) {
      listeners.set(event, listener);
      return this;
    },
    destroy(error?: Error) {
      destroyed.set('error', error);
      return this;
    },
    /** Simulates the socket completing its connection. */
    emitConnect() {
      listeners.get('connect')?.();
    },
    wasDestroyedWith: () => destroyed.get('error'),
  };
};

describe('ssrfProtectedGot', () => {
  afterEach(() => {
    Sinon.restore();
  });

  it('guards both protocols when protection is enabled', async () => {
    stubSsrfProtection(true);

    const agent = await captureGotAgent();

    // Covering only one protocol would leave a cross-protocol redirect unguarded.
    expect(agent).toMatchObject({
      http: { createConnection: expect.any(Function) as unknown },
      https: { createConnection: expect.any(Function) as unknown },
    });
  });

  it('leaves the agents untouched when protection is disabled', async () => {
    stubSsrfProtection(false);

    expect(await captureGotAgent()).toMatchObject({ http: undefined, https: undefined });
  });
});

describe('ssrfProtectedFetch', () => {
  afterEach(() => {
    Sinon.restore();
  });

  /**
   * A Jest VM context has no `undici` global dispatcher, so this asserts the fail-closed behavior:
   * without a dispatcher the request must not go out unprotected. The dispatcher itself is covered
   * by `guardSocket` below and by oidc-provider's own suite.
   */
  it('refuses to send unprotected when the dispatcher cannot be built', async () => {
    stubSsrfProtection(true);
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());

    await expect(ssrfProtectedFetch('https://example.com/', { method: 'POST' })).rejects.toThrow(
      'Failed to set up SSRF protection'
    );

    expect(fetchStub.called).toBe(false);
  });

  it('sends no dispatcher when protection is disabled', async () => {
    stubSsrfProtection(false);
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());

    await ssrfProtectedFetch('https://example.com/', { method: 'POST' });

    const [, init] = fetchStub.firstCall.args;
    expect(init).toMatchObject({ method: 'POST' });
    expect(dispatcherOf(init)).toBeUndefined();
  });
});

const guard = (address: string) => {
  const socket = createFakeSocket(address);

  guardSocket(socket as unknown as Socket);
  socket.emitConnect();

  return socket.wasDestroyedWith();
};

describe('guardSocket', () => {
  it.each([
    ['169.254.169.254', 'cloud metadata'],
    ['127.0.0.1', 'loopback'],
    ['10.1.2.3', 'private use'],
    ['100.64.0.1', 'shared address space'],
    ['::1', 'IPv6 loopback'],
    ['fd00::1', 'IPv6 unique local'],
    ['::ffff:192.168.1.1', 'IPv4-mapped private use'],
  ])('destroys a connection to %s (%s)', (address) => {
    expect(guard(address)).toMatchObject({
      message: 'hostname resolves to a special-use IP address',
    });
  });

  it.each([
    ['8.8.8.8', 'public IPv4'],
    ['::ffff:8.8.8.8', 'IPv4-mapped public address'],
    ['2606:4700:4700::1111', 'public IPv6'],
  ])('keeps a connection to %s (%s)', (address) => {
    expect(guard(address)).toBeUndefined();
  });
});
