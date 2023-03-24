import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConnectorFactories as _loadConnectorFactories } from '@logto/cli/lib/connector/index.js';
import { connectorDirectory } from '@logto/cli/lib/constants.js';
import { getConnectorPackagesFromDirectory } from '@logto/cli/lib/utils.js';
import { findPackage } from '@logto/shared';

export * from './types.js';

export const loadConnectorFactories = async () => {
  const currentDirname = path.dirname(fileURLToPath(import.meta.url));
  const cloudDirectory = await findPackage(currentDirname);
  const coreDirectory = cloudDirectory && path.join(cloudDirectory, '..', 'core');
  const directory = coreDirectory && path.join(coreDirectory, connectorDirectory);

  if (!directory || !existsSync(directory)) {
    return [];
  }

  const connectorPackages = await getConnectorPackagesFromDirectory(directory);

  const connectorFactories = await _loadConnectorFactories(connectorPackages, false);

  return connectorFactories;
};
