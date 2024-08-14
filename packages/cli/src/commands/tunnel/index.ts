import http from 'node:http';

import { isValidUrl } from '@logto/core-kit';
import { conditional } from '@silverhand/essentials';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import { type TunnelCommandArgs } from './types.js';
import {
  checkExperienceInput,
  createLogtoResponseHandler,
  createProxy,
  createStaticFileProxy,
  isLogtoRequestPath,
} from './utils.js';

const tunnel: CommandModule<unknown, TunnelCommandArgs> = {
  command: ['tunnel'],
  describe: 'Command for Logto tunnel',
  builder: (yargs) =>
    yargs
      .options({
        'experience-uri': {
          alias: ['x'],
          describe: 'The URI of your custom sign-in experience page.',
          type: 'string',
        },
        'experience-path': {
          alias: ['xp'],
          describe: 'The local folder path of your custom sign-in experience assets.',
          type: 'string',
        },
        endpoint: {
          alias: 'ep',
          describe:
            'Logto endpoint URI, which can be found in Logto Console. E.g.: https://<tenant-id>.logto.app/',
          type: 'string',
        },
        port: {
          alias: 'p',
          describe:
            'The port number where the tunnel service will be running on. Defaults to 9000.',
          type: 'number',
          default: 9000,
        },
        verbose: {
          alias: 'v',
          describe: 'Show verbose output.',
          type: 'boolean',
          default: false,
        },
      })
      .global('e'),
  handler: async ({ 'experience-uri': url, 'experience-path': path, endpoint, port, verbose }) => {
    checkExperienceInput(url, path);

    if (!endpoint || !isValidUrl(endpoint)) {
      consoleLog.fatal('A valid Logto endpoint URI must be provided.');
    }
    const logtoEndpointUrl = new URL(endpoint);
    const tunnelServiceUrl = new URL(`http://localhost:${port}`);

    const proxyLogtoRequest = createProxy(
      logtoEndpointUrl.href,
      async (proxyResponse, request, response) =>
        createLogtoResponseHandler({
          proxyResponse,
          request,
          response,
          logtoEndpointUrl,
          tunnelServiceUrl,
          verbose,
        })
    );
    const proxyExperienceServerRequest = conditional(url && createProxy(url));
    const proxyExperienceStaticFileRequest = conditional(path && createStaticFileProxy(path));

    const server = http.createServer((request, response) => {
      if (verbose) {
        consoleLog.info(`Incoming request: ${chalk.blue(request.method, request.url)}`);
      }

      // Tunneling the requests to Logto endpoint
      if (isLogtoRequestPath(request.url)) {
        void proxyLogtoRequest(request, response);
        return;
      }

      if (proxyExperienceServerRequest) {
        void proxyExperienceServerRequest(request, response);
        return;
      }

      if (proxyExperienceStaticFileRequest) {
        void proxyExperienceStaticFileRequest(request, response);
      }
    });

    server.listen(port, () => {
      consoleLog.info(`Logto tunnel is running on ${chalk.blue(tunnelServiceUrl.href)}`);
    });
  },
};

export default tunnel;
