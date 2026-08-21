/* eslint-disable @silverhand/fp/no-mutation -- local HTTP fixture counters increment per request */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { type AddressInfo } from 'node:net';

import { InteractionHookEvent } from '@logto/schemas';

import { generateHookTestPayload, sendWebhookRequest } from './utils.js';

type MockReply =
  | {
      status: number;
      headers?: Record<string, string>;
      body?: string;
    }
  | { reset: true };

type RetryServerFixture = {
  endpoint: string;
  getAttempts: () => number;
};

const listen = async (server: Server) =>
  new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve((server.address() as AddressInfo).port);
    });
  });

const close = async (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

const sendToServer = async (endpoint: string, retries?: number) =>
  sendWebhookRequest({
    hookConfig: {
      url: endpoint,
      retries,
    },
    payload: generateHookTestPayload('hook-id', InteractionHookEvent.PostSignIn),
    signingKey: 'signing-key',
  });

const withRetryServer = async (
  replyForAttempt: (attempt: number) => MockReply,
  run: (fixture: RetryServerFixture) => Promise<void>
) => {
  const state = { attempts: 0 };

  const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    state.attempts += 1;
    const reply = replyForAttempt(state.attempts);

    if ('reset' in reply) {
      request.socket.destroy();
      return;
    }

    response.writeHead(reply.status, reply.headers);
    response.end(reply.body);
  });

  const port = await listen(server);

  try {
    await run({
      endpoint: `http://127.0.0.1:${port}`,
      getAttempts: () => state.attempts,
    });
  } finally {
    await close(server);
  }
};

describe('sendWebhookRequest HTTP retries', () => {
  it.each([500, 501, 599])(
    'retries POST %s responses three times for a total of four attempts',
    async (status) => {
      await withRetryServer(
        () => ({ status }),
        async ({ endpoint, getAttempts }) => {
          await expect(sendToServer(endpoint)).rejects.toThrow();
          expect(getAttempts()).toBe(4);
        }
      );
    },
    20_000
  );

  it('stops retrying after a successful attempt', async () => {
    await withRetryServer(
      (attempt) =>
        attempt < 3
          ? { status: 500 }
          : {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
              body: '{"ok":true}',
            },
      async ({ endpoint, getAttempts }) => {
        await expect(sendToServer(endpoint)).resolves.toHaveProperty('status', 200);
        expect(getAttempts()).toBe(3);
      }
    );
  }, 20_000);

  it('does not retry 4xx responses', async () => {
    await withRetryServer(
      () => ({ status: 400 }),
      async ({ endpoint, getAttempts }) => {
        await expect(sendToServer(endpoint)).rejects.toThrow();
        expect(getAttempts()).toBe(1);
      }
    );
  });

  it('does not retry when the connection is reset', async () => {
    await withRetryServer(
      () => ({ reset: true }),
      async ({ endpoint, getAttempts }) => {
        await expect(sendToServer(endpoint)).rejects.toThrow();
        expect(getAttempts()).toBe(1);
      }
    );
  });

  it('does not retry when hook config retries is 0', async () => {
    await withRetryServer(
      () => ({ status: 500 }),
      async ({ endpoint, getAttempts }) => {
        await expect(sendToServer(endpoint, 0)).rejects.toThrow();
        expect(getAttempts()).toBe(1);
      }
    );
  });

  it('honors hook config retries when set below the default', async () => {
    await withRetryServer(
      () => ({ status: 500 }),
      async ({ endpoint, getAttempts }) => {
        await expect(sendToServer(endpoint, 1)).rejects.toThrow();
        expect(getAttempts()).toBe(2);
      }
    );
  }, 20_000);

  it.each(['0', '86400'])(
    'retries 503 even when Retry-After is %s',
    async (retryAfter) => {
      const startedAt = Date.now();

      await withRetryServer(
        () => ({ status: 503, headers: { 'Retry-After': retryAfter } }),
        async ({ endpoint, getAttempts }) => {
          await expect(sendToServer(endpoint)).rejects.toThrow();
          expect(getAttempts()).toBe(4);
          expect(Date.now() - startedAt).toBeLessThan(10_000);
        }
      );
    },
    20_000
  );
});

/* eslint-enable @silverhand/fp/no-mutation */
