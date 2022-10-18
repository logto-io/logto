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
  isUrl,
} from './utils';

export type InstallArgs = {
  path?: string;
  skipSeed: boolean;
  officialConnectors?: boolean;
  downloadUrl?: string;
};

const installLogto = async ({ path, skipSeed, officialConnectors, downloadUrl }: InstallArgs) => {
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

const install: CommandModule<
  unknown,
  {
    p?: string;
    ss: boolean;
    oc?: boolean;
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
      oc: {
        alias: 'official-connectors',
        describe: 'Add official connectors after downloading Logto',
        type: 'boolean',
      },
      du: {
        alias: 'download-url',
        describe: 'URL for downloading Logto, can be a local path to tar',
        type: 'string',
        hidden: true,
      },
    }),
  handler: async ({ p, ss, oc, du }) => {
    await installLogto({ path: p, skipSeed: ss, officialConnectors: oc, downloadUrl: du });
  },
};

export default install;
