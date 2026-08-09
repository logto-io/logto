/* eslint-disable @silverhand/fp/no-mutation -- local HTTP fixture counters increment per request */
import { createServer, type Server } from 'node:http';
import { type AddressInfo } from 'node:net';

import { InteractionHookEvent } from '@logto/schemas';

import { generateHookTestPayload, sendWebhookRequest } from './utils.js';

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

const sendToServer = async (port: number, retries?: number) =>
  sendWebhookRequest({
    hookConfig: {
      url: `http://127.0.0.1:${port}`,
      retries,
    },
    payload: generateHookTestPayload('hook-id', InteractionHookEvent.PostSignIn),
    signingKey: 'signing-key',
  });

describe('sendWebhookRequest HTTP retries', () => {
  it.each([500, 501, 599])(
    'retries POST %s responses three times for a total of four attempts',
    async (statusCode) => {
      const state = { attempts: 0 };
      const server = createServer((_request, response) => {
        state.attempts += 1;
        response.writeHead(statusCode);
        response.end();
      });

      try {
        const port = await listen(server);

        await expect(sendToServer(port)).rejects.toThrow();
        expect(state.attempts).toBe(4);
      } finally {
        await close(server);
      }
    },
    20_000
  );

  it('stops retrying after a successful attempt', async () => {
    const state = { attempts: 0 };
    const server = createServer((_request, response) => {
      state.attempts += 1;
      if (state.attempts < 3) {
        response.writeHead(500);
        response.end();
        return;
      }

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end('{"ok":true}');
    });

    try {
      const port = await listen(server);

      await expect(sendToServer(port)).resolves.toHaveProperty('status', 200);
      expect(state.attempts).toBe(3);
    } finally {
      await close(server);
    }
  }, 20_000);

  it('does not retry 4xx responses', async () => {
    const state = { attempts: 0 };
    const server = createServer((_request, response) => {
      state.attempts += 1;
      response.writeHead(400);
      response.end();
    });

    try {
      const port = await listen(server);

      await expect(sendToServer(port)).rejects.toThrow();
      expect(state.attempts).toBe(1);
    } finally {
      await close(server);
    }
  });

  it('ignores deprecated retries config and still retries 5xx three times', async () => {
    const state = { attempts: 0 };
    const server = createServer((_request, response) => {
      state.attempts += 1;
      response.writeHead(500);
      response.end();
    });

    try {
      const port = await listen(server);

      await expect(sendToServer(port, 0)).rejects.toThrow();
      expect(state.attempts).toBe(4);
    } finally {
      await close(server);
    }
  }, 20_000);
});

/* eslint-enable @silverhand/fp/no-mutation */
