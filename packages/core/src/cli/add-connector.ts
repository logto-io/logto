import 'module-alias/register';
import { getEnv } from '@silverhand/essentials';
import chalk from 'chalk';

import { addConnector } from '@/connectors/add-connectors';
import { defaultConnectorDirectory } from '@/env-set';

import { configDotEnv } from '../env-set/dot-env';

configDotEnv();

const addConnectorCli = async (packageName: string) => {
  const connectorDirectory = getEnv('CONNECTOR_DIRECTORY', defaultConnectorDirectory);

  await addConnector(packageName, connectorDirectory);
  console.log(`${chalk.blue(packageName)} added successfully.`);
};

const packageName = process.argv[2];

if (!packageName) {
  throw new Error('Please provide a package name');
}

void addConnectorCli(packageName);
