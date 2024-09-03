import { isValidUrl } from '@logto/core-kit';
import chalk from 'chalk';
import ora from 'ora';
import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import { type DeployCommandArgs } from './types.js';
import { checkExperienceAndZipPathInputs, deployToLogtoCloud } from './utils.js';

const tunnel: CommandModule<unknown, DeployCommandArgs> = {
  command: ['deploy'],
  describe: 'Deploy your custom UI assets to Logto Cloud',
  builder: (yargs) =>
    yargs
      .options({
        auth: {
          describe:
            'Auth credentials of your Logto M2M application. E.g.: <app-id>:<app-secret> (Docs: https://docs.logto.io/docs/recipes/interact-with-management-api/#create-an-m2m-app)',
          type: 'string',
        },
        endpoint: {
          describe:
            'Logto endpoint URI that points to your Logto Cloud instance. E.g.: https://<tenant-id>.logto.app/',
          type: 'string',
        },
        path: {
          alias: ['experience-path'],
          describe: 'The local folder path of your custom sign-in experience assets.',
          type: 'string',
        },
        resource: {
          alias: ['management-api-resource'],
          describe: 'Logto Management API resource indicator. Required if using custom domain.',
          type: 'string',
        },
        verbose: {
          describe: 'Show verbose output.',
          type: 'boolean',
          default: false,
        },
        zip: {
          alias: ['zip-path'],
          describe: 'The local folder path of your existing zip package.',
          type: 'string',
        },
      })
      .epilog(
        `Refer to our documentation for more details:\n${chalk.blue(
          'https://docs.logto.io/docs/references/tunnel-cli/deploy'
        )}`
      ),
  handler: async (options) => {
    const {
      auth,
      endpoint,
      path: experiencePath,
      resource: managementApiResource,
      verbose,
      zip: zipPath,
    } = options;
    if (!auth) {
      consoleLog.fatal(
        'Must provide valid Machine-to-Machine (M2M) authentication credentials. E.g. `--auth <app-id>:<app-secret>` or add `LOGTO_AUTH` to your environment variables.'
      );
    }
    if (!endpoint || !isValidUrl(endpoint)) {
      consoleLog.fatal(
        'A valid Logto endpoint URI must be provided. E.g. `--endpoint https://<tenant-id>.logto.app/` or add `LOGTO_ENDPOINT` to your environment variables.'
      );
    }

    await checkExperienceAndZipPathInputs(experiencePath, zipPath);

    const spinner = ora();

    if (verbose) {
      consoleLog.plain(
        `${chalk.bold('Starting deployment...')} ${chalk.gray('(with verbose output)')}`
      );
    } else {
      spinner.start('Deploying your custom UI assets to Logto Cloud...');
    }

    await deployToLogtoCloud({
      auth,
      endpoint,
      experiencePath,
      managementApiResource,
      verbose,
      zipPath,
    });

    if (!verbose) {
      spinner.succeed('Deploying your custom UI assets to Logto Cloud... Done.');
    }

    const endpointUrl = new URL(endpoint);
    spinner.succeed(`🎉 ${chalk.bold(chalk.green('Deployment successful!'))}`);
    consoleLog.plain(`${chalk.green('➜')} You can try your own sign-in UI on Logto Cloud now.`);
    consoleLog.plain(`${chalk.green('➜')} Make sure the Logto endpoint URI in your app is set to:`);
    consoleLog.plain(`  ${chalk.blue(chalk.bold(endpointUrl.href))}`);
    consoleLog.plain(
      `${chalk.green(
        '➜'
      )} If you are using social sign-in, make sure the social redirect URI is set to:`
    );
    consoleLog.plain(`  ${chalk.blue(chalk.bold(`${endpointUrl.href}callback/<connector-id>`))}`);
  },
};

export default tunnel;
