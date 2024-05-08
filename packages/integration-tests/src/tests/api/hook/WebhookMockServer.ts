import { createServer, type RequestListener, type Server } from 'node:http';

class WebhookMockServer {
  public readonly endpoint = `http://localhost:${this.port}`;
  private readonly server: Server;

  constructor(
    private readonly port: number,
    requestCallback?: (body: string) => void
  ) {
    const requestListener: RequestListener = (request, response) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      response.statusCode = 204;

      const data: Uint8Array[] = [];

      request.on('data', (chunk: Uint8Array) => {
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        data.push(chunk);
      });

      request.on('end', () => {
        response.writeHead(200, { 'Content-Type': 'application/json' });

        const payload: unknown = JSON.parse(Buffer.concat(data).toString());

        const body = JSON.stringify({
          signature: request.headers['logto-signature-sha-256'],
          payload,
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

export default WebhookMockServer;
