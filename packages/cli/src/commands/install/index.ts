import chalk from 'chalk';
import { CommandModule } from 'yargs';

import { getDatabaseUrlFromConfig } from '../../database';
import { log } from '../../utilities';
import {
  validateNodeVersion,
  inquireInstancePath,
  validateDatabase,
  downloadRelease,
  seedDatabase,
  createEnv,
  logFinale,
  decompress,
} from './utils';

export type InstallArgs = {
  path?: string;
  skipSeed: boolean;
};

const installLogto = async ({ path, skipSeed }: InstallArgs) => {
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
    log.info(`You can use ${chalk.green('db seed')} command to seed database when ready.`);
  } else {
    await seedDatabase(instancePath);
  }

  // Save to dot env
  await createEnv(instancePath, await getDatabaseUrlFromConfig());

  // Finale
  logFinale(instancePath);
};

const install: CommandModule<unknown, { path?: string; skipSeed: boolean }> = {
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
    }),
  handler: async ({ path, skipSeed }) => {
    await installLogto({ path, skipSeed });
  },
};

export default install;
