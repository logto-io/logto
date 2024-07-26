import * as http from 'node:http';

import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import {
  createOidcResponseHandler,
  createProxy,
  isLogtoRequestPath,
  isSignInExperienceRequestPath,
} from './utils.js';

const proxy: CommandModule<
  unknown,
  {
    u?: string;
    t?: string;
    p: number;
    d: boolean;
  }
> = {
  command: ['proxy'],
  describe: 'Command for Logto proxy',
  builder: (yargs) =>
    yargs
      .options({
        u: {
          alias: ['url', 'sign-in-experience-url'],
          describe: 'The URL of your custom sign-in experience page',
          type: 'string',
        },
        t: {
          alias: ['tenant', 'tenant-id'],
          describe: 'The ID of your Logto Cloud tenant',
          type: 'string',
        },
        p: {
          alias: 'port',
          describe: 'The port number where the proxy server will be running on',
          type: 'number',
          default: 9000,
        },
        d: {
          alias: 'dev',
          describe: 'Enable development features',
          type: 'boolean',
          default: false,
          hidden: true,
        },
      })
      .global('e'),
  handler: async ({ u: signInExpUrl, t: tenantId, p: port, d: isDev }) => {
    if (!signInExpUrl) {
      consoleLog.fatal('No sign-in experience URL provided.');
    }
    if (!tenantId) {
      consoleLog.fatal('No tenant ID provided.');
    }

    const logtoCloudDomain = isDev ? 'app.logto.dev' : 'logto.app';
    const logtoCloudEndpointUrl = new URL(`https://${tenantId}.${logtoCloudDomain}`);
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

      // Proxy the request to the sign-in experience URL
      if (isSignInExperienceRequestPath(request.url)) {
        void proxySignInExpRequest(request, response);
        return;
      }

      // TODO: add more rich content as user guide
      if (request.url === '/') {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Your Logto proxy server is up and running.');
        return;
      }

      response.writeHead(404);
      response.end('Not Found');
    });

    server.listen(port, () => {
      consoleLog.info(`Proxy server is running on ${chalk.blue(proxyUrl.href)}`);
    });
  },
};

export default proxy;
