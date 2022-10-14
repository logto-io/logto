import { readdir } from 'fs/promises';
import path from 'path';

import chalk from 'chalk';
import { CommandModule } from 'yargs';

import {
  getConnectorDirectory,
  getConnectorPackageName,
  inquireInstancePath,
  isOfficialConnector,
} from './utils';

const logConnectorNames = (type: string, names: string[]) => {
  if (names.length === 0) {
    return;
  }

  console.log();
  console.log(chalk.blue(type));
  console.log(names.map((value) => '  ' + value).join('\n'));
};

const list: CommandModule<{ path?: string }, { path?: string }> = {
  command: ['list', 'l'],
  describe: 'List added Logto connectors',
  handler: async ({ path: inputPath }) => {
    const directory = getConnectorDirectory(await inquireInstancePath(inputPath));
    const content = await readdir(directory, 'utf8');
    const rawNames = await Promise.all(
      content.map(async (value) => getConnectorPackageName(path.join(directory, value)))
    );
    const names = rawNames.filter((value): value is string => typeof value === 'string');
    const officialPackages = names.filter((name) => isOfficialConnector(name));
    const thirdPartyPackages = names.filter((name) => !isOfficialConnector(name));

    logConnectorNames('official'.toUpperCase(), officialPackages);
    logConnectorNames('3rd-party'.toUpperCase(), thirdPartyPackages);
  },
};

export default list;
