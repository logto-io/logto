import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import type { ConnectorPackage } from '../../utilities.js';
import { getConnectorPackagesFrom, isOfficialConnector } from './utils.js';

const logConnectorNames = (type: string, packages: ConnectorPackage[]) => {
  if (packages.length === 0) {
    return;
  }

  console.log();
  console.log(chalk.blue(type));
  console.log(packages.map(({ name }) => '  ' + name).join('\n'));
};

const list: CommandModule<{ path?: string }, { path?: string }> = {
  command: ['list', 'l'],
  describe: 'List added Logto connectors',
  handler: async ({ path: inputPath }) => {
    const packages = await getConnectorPackagesFrom(inputPath);
    const officialPackages = packages.filter(({ name }) => isOfficialConnector(name));
    const thirdPartyPackages = packages.filter(({ name }) => !isOfficialConnector(name));

    logConnectorNames('official'.toUpperCase(), officialPackages);
    logConnectorNames('3rd-party'.toUpperCase(), thirdPartyPackages);
  },
};

export default list;
