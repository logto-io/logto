import * as http from 'node:http';

import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import { createOidcResponseHandler, createProxy, isLogtoRequestPath } from './utils.js';

const proxy: CommandModule<
  unknown,
  {
    url?: string;
    tenant?: string;
    port: number;
    endpoint?: string;
  }
> = {
  command: ['proxy'],
  describe: 'Command for Logto proxy',
  builder: (yargs) =>
    yargs
      .options({
        url: {
          alias: ['u', 'sign-in-experience-url'],
          describe: 'The URL of your custom sign-in experience page',
          type: 'string',
        },
        tenant: {
          alias: ['t', 'tenant-id'],
          describe: 'The ID of your Logto Cloud tenant',
          type: 'string',
        },
        port: {
          alias: 'p',
          describe: 'The port number where the proxy server will be running on',
          type: 'number',
          default: 9000,
        },
        endpoint: {
          alias: 'logto-endpoint',
          describe:
            '[Internal] Specify Logto Cloud endpoint URL. E.g. `https://[tenant-id].app.logto.dev` for dev environment. Tenant ID will be omitted when this argument is provided.',
          type: 'string',
          hidden: true,
        },
      })
      .global('e'),
  handler: async ({ url: signInExpUrl, tenant: tenantId, port, endpoint }) => {
    if (!signInExpUrl) {
      consoleLog.fatal('No sign-in experience URL provided.');
    }
    if (!tenantId && !endpoint) {
      consoleLog.fatal('No tenant ID provided.');
    }

    const logtoCloudEndpointUrl = new URL(endpoint ?? `https://${tenantId}.logto.app}`);
    const proxyUrl = new URL(`http://localhost:${port}`);

    const proxyOidcRequest = createProxy(
      logtoCloudEndpointUrl.href,
      async (proxyResponse, request, response) =>
        createOidcResponseHandler({
          proxyResponse,
          request,
          response,
          logtoCloudEndpointUrl,
          proxyUrl,
        })
    );
    const proxySignInExpRequest = createProxy(signInExpUrl);

    const server = http.createServer((request, response) => {
      consoleLog.info(`Incoming request: ${chalk.blue(request.url)}`);

      // Proxy the request to Logto Cloud endpoint
      if (isLogtoRequestPath(request.url)) {
        void proxyOidcRequest(request, response);
        return;
      }

      void proxySignInExpRequest(request, response);
    });

    server.listen(port, () => {
      consoleLog.info(`Proxy server is running on ${chalk.blue(proxyUrl.href)}`);
    });
  },
};

export default proxy;
