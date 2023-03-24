import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { getDatabaseUrlFromConfig } from '../../database.js';
import { log } from '../../utils.js';

import {
  validateNodeVersion,
  inquireInstancePath,
  validateDatabase,
  downloadRelease,
  seedDatabase,
  createEnv,
  logFinale,
  decompress,
  isUrl,
} from './utils.js';

export type InstallArgs = {
  path?: string;
  skipSeed: boolean;
  cloud: boolean;
  downloadUrl?: string;
};

const installLogto = async ({ path, skipSeed, downloadUrl, cloud }: InstallArgs) => {
  validateNodeVersion();

  // Get instance path
  const instancePath = await inquireInstancePath(path);

  // Validate if user has a valid database
  await validateDatabase();

  // Download and decompress
  const tarPath =
    !downloadUrl || isUrl(downloadUrl) ? await downloadRelease(downloadUrl) : downloadUrl;
  await decompress(instancePath, tarPath);

  // Seed database
  if (skipSeed) {
    log.info(
      `Skipped database seeding.\n\n' + '  You can use the ${chalk.green(
        'db seed'
      )} command to seed database when ready.\n`
    );
  } else {
    await seedDatabase(instancePath, cloud);
  }

  // Save to dot env
  await createEnv(instancePath, await getDatabaseUrlFromConfig());

  // Finale
  logFinale(instancePath);
};

const install: CommandModule<
  unknown,
  {
    p?: string;
    ss: boolean;
    cloud: boolean;
    du?: string;
  }
> = {
  command: ['init', 'i', 'install'],
  describe: 'Download and run the latest Logto release',
  builder: (yargs) =>
    yargs.options({
      p: {
        alias: 'path',
        describe: 'Path of Logto, must be a non-existing path',
        type: 'string',
      },
      ss: {
        alias: 'skip-seed',
        describe: 'Skip Logto database seeding',
        type: 'boolean',
        default: false,
      },
      cloud: {
        describe: 'Init Logto for cloud',
        type: 'boolean',
        hidden: true,
        default: false,
      },
      du: {
        alias: 'download-url',
        describe: 'URL for downloading Logto, can be a local path to tar',
        type: 'string',
        hidden: true,
      },
    }),
  handler: async ({ p, ss, cloud, du }) => {
    await installLogto({ path: p, skipSeed: ss, cloud, downloadUrl: du });
  },
};

export default install;
