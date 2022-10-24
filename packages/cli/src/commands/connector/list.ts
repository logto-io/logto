import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { getConnectorPackagesFrom, isOfficialConnector } from './utils';

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
    const packages = await getConnectorPackagesFrom(inputPath);
    const packageNames = packages.map(({ name }) => name);
    const officialPackages = packageNames.filter((name) => isOfficialConnector(name));
    const thirdPartyPackages = packageNames.filter((name) => !isOfficialConnector(name));

    logConnectorNames('official'.toUpperCase(), officialPackages);
    logConnectorNames('3rd-party'.toUpperCase(), thirdPartyPackages);
  },
};

export default list;
