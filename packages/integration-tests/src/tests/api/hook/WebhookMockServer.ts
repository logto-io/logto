import { createHmac } from 'node:crypto';
import { createServer, type RequestListener, type Server } from 'node:http';

import { hookEventGuard } from '@logto/schemas';
import { z } from 'zod';

/**
 * A mock server that listens for incoming requests and responds with the request body.
 *
 * @example
 * const server = new WebhookMockServer(3000);
 * await server.listen();
 */
class WebhookMockServer {
  public readonly endpoint = `http://localhost:${this.port}`;
  private readonly server: Server;

  constructor(
    /** The port number to listen on. */
    private readonly port: number,
    /** A callback that is called with the request body when a request is received. */
    requestCallback?: (body: string) => void
  ) {
    const requestListener: RequestListener = (request, response) => {
      const data: Uint8Array[] = [];

      request.on('data', (chunk: Uint8Array) => {
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        data.push(chunk);
      });

      request.on('end', () => {
        response.writeHead(200, { 'Content-Type': 'application/json' });

        // Keep the raw payload for signature verification
        const rawPayload = Buffer.concat(data).toString();
        const payload: unknown = JSON.parse(rawPayload);

        const body = JSON.stringify({
          signature: request.headers['logto-signature-sha-256'],
          payload,
          rawPayload,
        });

        requestCallback?.(body);

        response.end(body);
      });
    };

    this.server = createServer(requestListener);
  }

  public async listen() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        resolve(true);
      });
    });
  }

  public async close() {
    return new Promise((resolve) => {
      this.server.close(() => {
        resolve(true);
      });
    });
  }
}

export const mockHookResponseGuard = z.object({
  body: z.object({
    signature: z.string(),
    payload: z
      .object({
        event: hookEventGuard,
        createdAt: z.string(),
        hookId: z.string(),
      })
      .catchall(z.any()),
    // Use the raw payload for signature verification
    rawPayload: z.string(),
  }),
});

export default WebhookMockServer;

export const verifySignature = (payload: string, secret: string, signature: string) => {
  const calculatedSignature = createHmac('sha256', secret).update(payload).digest('hex');
  return calculatedSignature === signature;
};
