import 'module-alias/register';
import { getEnv } from '@silverhand/essentials';

import { addOfficialConnectors } from '@/connectors/add-connectors';
import { defaultConnectorDirectory } from '@/env-set';
import { configDotEnv } from '@/env-set/dot-env';

configDotEnv();

const addOfficialConnectorsCli = async () => {
  const connectorDirectory = getEnv('CONNECTOR_DIRECTORY', defaultConnectorDirectory);
  await addOfficialConnectors(connectorDirectory);
};

void addOfficialConnectorsCli();
