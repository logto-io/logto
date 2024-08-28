import { existsSync } from 'node:fs';
import path from 'node:path';

import { isValidUrl } from '@logto/core-kit';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import { type DeployCommandArgs } from './types.js';
import { deployToLogtoCloud } from './utils.js';

const tunnel: CommandModule<unknown, DeployCommandArgs> = {
  command: ['deploy'],
  describe: 'Deploy your custom UI assets to Logto Cloud',
  builder: (yargs) =>
    yargs.options({
      'app-id': {
        alias: ['id'],
        describe: 'ID of your Logto M2M application',
        type: 'string',
      },
      'app-secret': {
        alias: ['secret'],
        describe: 'Secret of your Logto M2M application',
        type: 'string',
      },
      endpoint: {
        describe:
          'Logto endpoint URI that points to your Logto Cloud instance. E.g.: https://<tenant-id>.logto.app/',
        type: 'string',
      },
      'experience-path': {
        alias: ['path'],
        describe: 'The local folder path of your custom sign-in experience assets.',
        type: 'string',
      },
      verbose: {
        describe: 'Show verbose output.',
        type: 'boolean',
        default: false,
      },
    }),
  handler: async ({
    'app-id': appId,
    'app-secret': appSecret,
    'experience-path': experiencePath,
    endpoint,
    verbose,
  }) => {
    if (!appId) {
      consoleLog.fatal('Must provide a valid Machine-to-Machine (M2M) application ID.');
    }
    if (!appSecret) {
      consoleLog.fatal('Must provide a valid Machine-to-Machine (M2M) application secret.');
    }
    if (!endpoint || !isValidUrl(endpoint)) {
      consoleLog.fatal('A valid Logto endpoint URI must be provided.');
    }
    if (!experiencePath) {
      consoleLog.fatal('A valid experience path must be provided.');
    }
    if (!existsSync(path.join(experiencePath, 'index.html'))) {
      consoleLog.fatal('The provided path must contain an "index.html" file.');
    }

    consoleLog.info('Deploying to Logto Cloud...');

    await deployToLogtoCloud({ appId, appSecret, endpoint, experiencePath, verbose });

    const endpointUrl = new URL(endpoint);
    consoleLog.info(
      `🎉 Deployment successful!
${chalk.green('➜')} You can try your own sign-in UI on Logto Cloud now.}

${chalk.green('➜')} Make sure the Logto endpoint URI in your app is set to:

  ${chalk.bold(endpointUrl.href)}

${chalk.green('➜')} If you are using social sign-in, make sure the social redirect URI is set to:

  ${chalk.bold(`${endpointUrl.href}callback/<connector-id>`)}
      `
    );
  },
};

export default tunnel;
