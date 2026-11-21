/* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods -- local HTTP fixture tracks per-request counters and active timers */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { type AddressInfo } from 'node:net';

import { type ClaimedJob } from '@logto/job-queue';
import { InteractionHookEvent, LogResult } from '@logto/schemas';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import { type WebhookDeliveryHook } from '#src/queries/job-queue.js';

import {
  createWebhookJobHandler,
  parseWebhookJobPayload,
  webhookJobLeaseMs,
  webhookJobType,
  type WebhookJobPayload,
} from './webhook-handler.js';

const { jest } = import.meta;

type TimeoutServerFixture = {
  endpoint: string;
  getAttempts: () => number;
  waitForClosedConnections: (expectedCount: number) => Promise<number>;
};

const listen = async (server: Server) =>
  new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve((server.address() as AddressInfo).port);
    });
  });

const close = async (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.closeAllConnections();
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

const withHttpServer = async (
  onRequest: (
    request: IncomingMessage,
    response: ServerResponse,
    attempt: number,
    trackTimer: (timer: ReturnType<typeof setInterval>) => void
  ) => void,
  run: (fixture: TimeoutServerFixture) => Promise<void>
) => {
  const state = {
    attempts: 0,
    closed: 0,
    waiters: [] as Array<() => void>,
    timers: new Set<ReturnType<typeof setInterval>>(),
  };

  const trackTimer = (timer: ReturnType<typeof setInterval>) => {
    state.timers.add(timer);
  };

  const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    state.attempts += 1;
    response.on('close', () => {
      state.closed += 1;
      for (const notify of state.waiters) {
        notify();
      }
    });
    onRequest(request, response, state.attempts, trackTimer);
  });

  const port = await listen(server);

  const waitForClosedConnections = async (expectedCount: number): Promise<number> => {
    if (state.closed >= expectedCount) {
      return state.closed;
    }

    await new Promise<void>((resolve) => {
      const safetyTimer = setTimeout(resolve, 1000);
      const check = () => {
        if (state.closed >= expectedCount) {
          clearTimeout(safetyTimer);
          resolve();
        }
      };
      state.waiters.push(check);
    });

    return state.closed;
  };

  try {
    await run({
      endpoint: `http://127.0.0.1:${port}`,
      getAttempts: () => state.attempts,
      waitForClosedConnections,
    });
  } finally {
    for (const timer of state.timers) {
      clearInterval(timer);
      clearTimeout(timer);
    }
    await close(server);
  }
};

const rawPayload = JSON.stringify({
  event: InteractionHookEvent.PostSignIn,
  createdAt: '2026-11-20T00:00:00.000Z',
  hookId: 'hook-1',
  deliveryId: 'delivery-1',
  userId: 'user-1',
});

const createClaimedJob = (): ClaimedJob<WebhookJobPayload> => ({
  tenantId: 'tenant-1',
  id: 'delivery-1',
  type: webhookJobType,
  groupKey: 'hook-1',
  dedupeKey: 'delivery-1',
  rawPayload,
  payload: parseWebhookJobPayload(rawPayload),
  attempts: 1,
  nextAttemptAt: Date.now() + webhookJobLeaseMs,
  claimedBy: 'worker-1',
  createdAt: Date.now(),
});

const createHook = (url: string, retries?: number): WebhookDeliveryHook => ({
  id: 'hook-1',
  config: { url, ...(retries === undefined ? {} : { retries }) },
  signingKey: 'live-signing-key',
  enabled: true,
});

describe('webhook job handler delivery and body-read bounds', () => {
  beforeEach(() => {
    // Loopback test servers intentionally use local addresses guarded in production by SSRF checks.
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isSsrfProtectionEnabled: false,
    });
  });

  afterEach(() => {
    Sinon.restore();
    jest.clearAllMocks();
  });

  it('aborts and retries when 200 headers arrive immediately but body stalls', async () => {
    await withHttpServer(
      (_request, response) => {
        response.writeHead(200, { 'content-type': 'text/plain' });
        response.write('partial ');
      },
      async ({ endpoint, waitForClosedConnections }) => {
        const handler = createWebhookJobHandler(
          { findHookForDelivery: async () => createHook(endpoint, 0) },
          { deliveryTimeoutMs: 400, bodyReadTimeoutMs: 150 }
        );
        const startedAt = Date.now();
        const result = await handler.handle(createClaimedJob());
        const elapsedMs = Date.now() - startedAt;

        expect(elapsedMs).toBeLessThan(350);
        expect(result.status).toBe('retry');
        expect(result.meta?.log?.payload).toMatchObject({
          result: LogResult.Error,
          hookId: 'hook-1',
          attempts: 1,
        });
        expect(result.meta?.log?.payload.error).toContain('body read timed out after 150ms');
        expect(result.meta?.log?.payload).not.toHaveProperty('response');
        await expect(waitForClosedConnections(1)).resolves.toBeGreaterThanOrEqual(1);
      }
    );
  });

  it('aborts and retries when 200 response continuously trickles bytes', async () => {
    await withHttpServer(
      (_request, response, _attempt, trackTimer) => {
        response.writeHead(200, { 'content-type': 'text/plain' });
        const interval = setInterval(() => {
          if (!response.destroyed) {
            response.write('x');
          }
        }, 20);
        trackTimer(interval);
        response.on('close', () => {
          clearInterval(interval);
        });
      },
      async ({ endpoint, waitForClosedConnections }) => {
        const handler = createWebhookJobHandler(
          { findHookForDelivery: async () => createHook(endpoint, 0) },
          { deliveryTimeoutMs: 400, bodyReadTimeoutMs: 150 }
        );
        const startedAt = Date.now();
        const result = await handler.handle(createClaimedJob());
        const elapsedMs = Date.now() - startedAt;

        expect(elapsedMs).toBeLessThan(350);
        expect(result.status).toBe('retry');
        expect(result.meta?.log?.payload).toMatchObject({
          result: LogResult.Error,
          attempts: 1,
        });
        expect(result.meta?.log?.payload.error).toContain('body read timed out after 150ms');
        expect(result.meta?.log?.payload).not.toHaveProperty('response');
        await expect(waitForClosedConnections(1)).resolves.toBeGreaterThanOrEqual(1);
      }
    );
  });

  it('aborts stalled error body read on HTTPError without hanging and marks it retryable', async () => {
    await withHttpServer(
      (_request, response) => {
        response.writeHead(500, { 'content-type': 'text/plain' });
        response.write('upstream ');
      },
      async ({ endpoint, waitForClosedConnections }) => {
        const handler = createWebhookJobHandler(
          { findHookForDelivery: async () => createHook(endpoint, 0) },
          { deliveryTimeoutMs: 400, bodyReadTimeoutMs: 150 }
        );
        const startedAt = Date.now();
        const result = await handler.handle(createClaimedJob());
        const elapsedMs = Date.now() - startedAt;

        expect(elapsedMs).toBeLessThan(350);
        expect(result.status).toBe('retry');
        expect(result.meta?.log?.payload).toMatchObject({
          result: LogResult.Error,
          hookId: 'hook-1',
          attempts: 1,
        });
        expect(result.meta?.log?.payload.error).toContain('500');
        expect(result.meta?.log?.payload).not.toHaveProperty('response');
        await expect(waitForClosedConnections(1)).resolves.toBeGreaterThanOrEqual(1);
      }
    );
  });

  it('aborts slow response headers at deliveryTimeoutMs and returns retry', async () => {
    await withHttpServer(
      (_request, response, _attempt, trackTimer) => {
        const timer = setTimeout(() => {
          if (!response.destroyed) {
            response.writeHead(500);
            response.end('too late');
          }
        }, 500);
        trackTimer(timer);
        response.on('close', () => {
          clearTimeout(timer);
        });
      },
      async ({ endpoint, getAttempts, waitForClosedConnections }) => {
        const handler = createWebhookJobHandler(
          { findHookForDelivery: async () => createHook(endpoint, 3) },
          { deliveryTimeoutMs: 200, bodyReadTimeoutMs: 100 }
        );
        const startedAt = Date.now();
        const result = await handler.handle(createClaimedJob());
        const elapsedMs = Date.now() - startedAt;

        expect(elapsedMs).toBeLessThan(400);
        expect(getAttempts()).toBe(1);
        expect(result.status).toBe('retry');
        expect(result.meta?.log?.payload).toMatchObject({
          result: LogResult.Error,
          attempts: 1,
        });
        expect(result.meta?.log?.payload.error).toContain('Webhook delivery timed out after 200ms');
        expect(result.meta?.log?.payload).not.toHaveProperty('response');
        await expect(waitForClosedConnections(1)).resolves.toBeGreaterThanOrEqual(1);
      }
    );
  });

  it('sends a single HTTP attempt ignoring hook retries and preserves Retry-After on 503', async () => {
    await withHttpServer(
      (_request, response) => {
        response.writeHead(503, { 'Retry-After': '120', 'content-type': 'text/plain' });
        response.end('maintenance');
      },
      async ({ endpoint, getAttempts }) => {
        const handler = createWebhookJobHandler({
          findHookForDelivery: async () => createHook(endpoint, 3),
        });
        const result = await handler.handle(createClaimedJob());

        expect(getAttempts()).toBe(1);
        expect(result).toMatchObject({
          status: 'retry',
          retryAfterMs: 120_000,
        });
        expect(result.meta?.log?.payload).toMatchObject({
          result: LogResult.Error,
          attempts: 1,
          response: { statusCode: 503, body: 'maintenance' },
        });
      }
    );
  });
});

/* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */
