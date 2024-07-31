import * as http from 'node:http';

import { isValidUrl } from '@logto/core-kit';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import { type ProxyCommandArgs } from './types.js';
import { createLogtoResponseHandler, createProxy, isLogtoRequestPath } from './utils.js';

const proxy: CommandModule<unknown, ProxyCommandArgs> = {
  command: ['proxy'],
  describe: 'Command for Logto proxy',
  builder: (yargs) =>
    yargs
      .options({
        'experience-uri': {
          alias: ['x'],
          describe: 'The URI of your custom sign-in experience page.',
          type: 'string',
        },
        'tenant-id': {
          alias: ['t'],
          describe:
            'Your Logto Cloud tenant ID. WHen provided, endpoint URI will be set to `https://<tenant-id>.logto.app` by default.',
          type: 'string',
        },
        endpoint: {
          alias: 'ep',
          describe:
            'Specify the full Logto endpoint URI, which takes precedence over tenant ID when provided.',
          type: 'string',
        },
        port: {
          alias: 'p',
          describe: 'The port number where the proxy server will be running on. Defaults to 9000.',
          type: 'number',
          default: 9000,
        },
      })
      .global('e'),
  handler: async ({ 'experience-uri': expUri, 'tenant-id': tenantId, endpoint, port }) => {
    if (!expUri || !isValidUrl(expUri)) {
      consoleLog.fatal(
        'A valid sign-in experience URI must be provided. E.g.: http://localhost:4000'
      );
    }
    if (!tenantId && (!endpoint || !isValidUrl(endpoint))) {
      consoleLog.fatal('Either tenant ID or a valid Logto endpoint URI must be provided.');
    }

    const logtoEndpointUrl = new URL(endpoint ?? `https://${tenantId}.logto.app}`);
    const proxyUrl = new URL(`http://localhost:${port}`);

    const proxyLogtoRequest = createProxy(
      logtoEndpointUrl.href,
      async (proxyResponse, request, response) =>
        createLogtoResponseHandler({
          proxyResponse,
          request,
          response,
          logtoEndpointUrl,
          proxyUrl,
        })
    );
    const proxySignInExpRequest = createProxy(expUri);

    const server = http.createServer((request, response) => {
      consoleLog.info(`Incoming request: ${chalk.blue(request.url)}`);

      // Proxy the requests to Logto endpoint
      if (isLogtoRequestPath(request.url)) {
        void proxyLogtoRequest(request, response);
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
