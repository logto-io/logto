/**
 * @fileoverview
 * A test suite for the backchannel logout feature. Note that Console is the only possible
 * application that can use in this test, since:
 *
 * - The headless client in API tests cannot follow a soft redirect, while the backchannel logout
 * will only be triggered when a logout confirmation is received, which needs a [soft redirect](https://github.com/panva/node-oidc-provider/blob/f52140233146e77d0dcc34ee44fd2b95b488c8d9/lib/actions/end_session.js#L76)
 * on the end session page.
 * - We cannot update demo app's OIDC client metadata via API, then it'll be tricky to add the
 * backchannel logout URI conditionally (use environment variables looks not right).
 * - To trigger the backchannel logout on other apps, a [shared session](https://github.com/panva/node-oidc-provider/blob/f52140233146e77d0dcc34ee44fd2b95b488c8d9/lib/actions/end_session.js#L135)
 * is required, which requires us to sign in with all the apps in the same browser session. This
 * sounds tricky. Since we can trust the `oidc-provider` library's implementation, we can just
 * test the backchannel logout feature of the Console application.
 *
 * In summary, we will set the backchannel logout URI for the Console application, then sign out
 * from the Console and check if the backchannel logout endpoint is called.
 */

import { type Server, type RequestListener, createServer } from 'node:http';

import { adminConsoleApplicationId } from '@logto/schemas';

import { authedAdminTenantApi } from '#src/api/api.js';
import ExpectConsole from '#src/ui-helpers/expect-console.js';
import { waitFor } from '#src/utils.js';

type RequestHistory = {
  method?: string;
  pathname?: string;
  body: string;
};

class MockServer {
  public readonly endpoint = `http://localhost:${this.port}`;
  public readonly history: RequestHistory[] = [];
  private readonly server: Server;

  constructor(
    /** The port number to listen on. */
    private readonly port: number
  ) {
    // eslint-disable-next-line unicorn/consistent-function-scoping -- We need to access `this`
    const requestListener: RequestListener = (request, response) => {
      const data: Uint8Array[] = [];

      request.on('data', (chunk: Uint8Array) => {
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        data.push(chunk);
      });

      request.on('end', () => {
        const body = Buffer.concat(data).toString();
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        this.history.push({ method: request.method, pathname: request.url, body });
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

const port = 9998;
const mockServer = new MockServer(port);
const backchannelLogoutUri = `http://localhost:${port}/backchannel_logout`;

describe('backchannel logout', () => {
  beforeAll(async () => {
    await mockServer.listen();
  });

  afterAll(async () => {
    await mockServer.close();
  });

  it('should call the backchannel logout endpoint when a user logs out', async () => {
    await authedAdminTenantApi.patch('applications/' + adminConsoleApplicationId, {
      json: {
        oidcClientMetadata: {
          backchannelLogoutUri,
        },
      },
    });
    expect(mockServer.history.length).toBe(0);

    const expectConsole = new ExpectConsole(await browser.newPage());
    await expectConsole.start();
    await expectConsole.end();

    // Give some time for redirecting and processing the backchannel logout request
    await waitFor(100);

    expect(mockServer.history.length).toBe(1);
    // Only check method and pathname since we trust the `oidc-provider` library's implementation
    expect(mockServer.history[0]).toMatchObject({
      method: 'POST',
      pathname: '/backchannel_logout',
    });
  });
});
