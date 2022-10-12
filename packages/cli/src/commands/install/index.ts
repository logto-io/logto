import chalk from 'chalk';
import { CommandModule } from 'yargs';

import { getDatabaseUrlFromConfig } from '../../database';
import { log } from '../../utilities';
import { addOfficialConnectors } from '../connector/utils';
import {
  validateNodeVersion,
  inquireInstancePath,
  validateDatabase,
  downloadRelease,
  seedDatabase,
  createEnv,
  logFinale,
  decompress,
  inquireOfficialConnectors,
} from './utils';

export type InstallArgs = {
  path?: string;
  skipSeed: boolean;
  officialConnectors?: boolean;
};

const installLogto = async ({ path, skipSeed, officialConnectors }: InstallArgs) => {
  validateNodeVersion();

  // Get instance path
  const instancePath = await inquireInstancePath(path);

  // Validate if user has a valid database
  await validateDatabase();

  // Download and decompress
  const tarPath = await downloadRelease();
  await decompress(instancePath, tarPath);

  // Seed database
  if (skipSeed) {
    log.info(
      `Skipped database seeding.\n\n' + '  You can use the ${chalk.green(
        'db seed'
      )} command to seed database when ready.\n`
    );
  } else {
    await seedDatabase(instancePath);
  }

  // Save to dot env
  await createEnv(instancePath, await getDatabaseUrlFromConfig());

  // Add official connectors
  if (await inquireOfficialConnectors(officialConnectors)) {
    await addOfficialConnectors(instancePath);
  } else {
    log.info(
      'Skipped adding official connectors.\n\n' +
        `  You can use the ${chalk.green('connector add')} command to add connectors at any time.\n`
    );
  }

  // Finale
  logFinale(instancePath);
};

const install: CommandModule<unknown, InstallArgs> = {
  command: ['init', 'i', 'install'],
  describe: 'Download and run the latest Logto release',
  builder: (yargs) =>
    yargs.options({
      path: {
        alias: 'p',
        describe: 'Path of Logto, must be a non-existing path',
        type: 'string',
      },
      skipSeed: {
        alias: 'ss',
        describe: 'Skip Logto database seeding',
        type: 'boolean',
        default: false,
      },
      officialConnectors: {
        alias: 'oc',
        describe: 'Install official connectors after downloading Logto',
        type: 'boolean',
      },
    }),
  handler: async ({ path, skipSeed, officialConnectors }) => {
    await installLogto({ path, skipSeed, officialConnectors });
  },
};

export default install;
