import { randomBytes } from 'node:crypto';
import { type Server } from 'node:http';

import { afterAll, describe, expect, it, vi } from 'vitest';

import { createPortalHttpServer } from './http.js';
import { type SettingsStore } from './settings.js';
import { PortalSetup } from './setup.js';
import { UpstreamPool } from './upstream-pool.js';

/**
 * Covers the one-time setup in src/setup.ts and the POST /setup route in src/http.ts. The settings
 * store is an in-memory fake, so these tests do not depend on a database or file.
 */
const memoryStore = (initial: { internalSecret?: string } = {}) => {
  const saveInternalSecret = vi.fn<(secret: string) => Promise<void>>();
  const clear = vi.fn<() => Promise<void>>();
  const store: SettingsStore = {
    load: async () => ({ ...initial }),
    saveInternalSecret,
    clear,
  };

  return { store, saveInternalSecret, clear };
};

const newSecret = () => randomBytes(32).toString('hex');

describe('PortalSetup', () => {
  it('issues a setup token while unconfigured', async () => {
    const { store } = memoryStore();
    const setup = await PortalSetup.create(store);

    expect(setup.pendingToken()).toBeDefined();
    expect(setup.internalSecret()).toBeUndefined();
  });

  it('issues no token once a secret is saved', async () => {
    const { store } = memoryStore({ internalSecret: newSecret() });
    const setup = await PortalSetup.create(store);

    expect(setup.pendingToken()).toBeUndefined();
    expect(setup.internalSecret()).toBeDefined();
  });

  it('rejects a wrong token and saves nothing', async () => {
    const { store, saveInternalSecret } = memoryStore();
    const setup = await PortalSetup.create(store);

    await expect(setup.complete('wrong', newSecret())).resolves.toBe('invalid-token');
    expect(saveInternalSecret).not.toHaveBeenCalled();
    expect(setup.internalSecret()).toBeUndefined();
  });

  it('holds the secret as pending until confirmed, then refuses to change it', async () => {
    const { store, saveInternalSecret } = memoryStore();
    const setup = await PortalSetup.create(store);
    const token = setup.pendingToken() ?? '';
    const secret = newSecret();

    await expect(setup.complete(token, secret)).resolves.toBe('pending');
    expect(saveInternalSecret).not.toHaveBeenCalled();
    expect(setup.internalSecret()).toBe(secret);

    await expect(setup.confirm(token, secret)).resolves.toBe('completed');
    expect(saveInternalSecret).toHaveBeenCalledWith(secret);
    expect(setup.pendingToken()).toBeUndefined();

    await expect(setup.complete(token, newSecret())).resolves.toBe('already-configured');
    expect(setup.internalSecret()).toBe(secret);
  });

  it('lets a retry replace the pending secret before confirmation', async () => {
    const { store, saveInternalSecret } = memoryStore();
    const setup = await PortalSetup.create(store);
    const token = setup.pendingToken() ?? '';
    const retried = newSecret();

    await setup.complete(token, newSecret());
    await expect(setup.complete(token, retried)).resolves.toBe('pending');
    await expect(setup.confirm(token, retried)).resolves.toBe('completed');
    expect(saveInternalSecret).toHaveBeenCalledWith(retried);
  });

  it('refuses to confirm a secret that was never held as pending', async () => {
    const { store, saveInternalSecret } = memoryStore();
    const setup = await PortalSetup.create(store);
    const token = setup.pendingToken() ?? '';

    await setup.complete(token, newSecret());
    await expect(setup.confirm(token, newSecret())).resolves.toBe('invalid-token');
    expect(saveInternalSecret).not.toHaveBeenCalled();
  });
});

/** Starts the portal HTTP server with an unconfigured setup, and returns it with its port. */
const startServer = async () => {
  const { store } = memoryStore();
  const setup = await PortalSetup.create(store);
  const http: Server = createPortalHttpServer({
    verify: async () => ({ sub: 'alice', scopes: [] }),
    registry: {
      listForOwner: vi.fn(async () => []),
      findForOwner: vi.fn<() => Promise<undefined>>(),
      add: vi.fn(),
      remove: vi.fn(async () => false),
    },
    setup,
    pool: new UpstreamPool(),
    audit: vi.fn(),
  });

  await new Promise<void>((resolve) => {
    http.listen(0, '127.0.0.1', () => {
      resolve();
    });
  });

  const address = http.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  return { http, setup, port };
};

describe('PortalSetup reset', () => {
  it('clears the secret and issues a new token', async () => {
    const { store, clear } = memoryStore({ internalSecret: newSecret() });
    const setup = await PortalSetup.create(store);

    const token = await setup.reset();

    expect(clear).toHaveBeenCalled();
    expect(setup.internalSecret()).toBeUndefined();
    expect(setup.pendingToken()).toBe(token);
  });
});

describe('POST /setup', () => {
  const fixturePromise = startServer();

  afterAll(async () => {
    const { http } = await fixturePromise;
    await new Promise<void>((resolve) => {
      http.close(() => {
        resolve();
      });
    });
  });

  const post = async (body: unknown) => {
    const { port } = await fixturePromise;

    return fetch(`http://127.0.0.1:${port}/setup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('answers 401 for a wrong token', async () => {
    const response = await post({ token: 'wrong', internalSecret: newSecret() });

    expect(response.status).toBe(401);
  });

  it('answers 201 for setup, 201 for confirm, then 409 on a second attempt', async () => {
    const { setup, port } = await fixturePromise;
    const token = setup.pendingToken() ?? '';
    const secret = newSecret();

    const first = await post({ token, internalSecret: secret });
    expect(first.status).toBe(201);

    const confirmed = await fetch(`http://127.0.0.1:${port}/setup/confirm`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, internalSecret: secret }),
    });
    expect(confirmed.status).toBe(201);

    const second = await post({ token, internalSecret: newSecret() });
    expect(second.status).toBe(409);
  });

  it('refuses a reset without the current internal secret', async () => {
    const { port } = await fixturePromise;

    const response = await fetch(`http://127.0.0.1:${port}/setup/reset`, {
      method: 'POST',
      headers: { 'x-portal-internal-secret': 'not-the-secret' },
    });

    expect(response.status).toBe(401);
  });

  it('rejects a secret that is too short', async () => {
    const response = await post({ token: 'anything', internalSecret: 'short' });

    expect(response.status).toBe(400);
  });
});
