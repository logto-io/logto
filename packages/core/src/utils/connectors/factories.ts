import { existsSync } from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

import { connectorDirectory } from '@logto/cli/lib/constants.js';
import { getConnectorPackagesFromDirectory } from '@logto/cli/lib/utils.js';
import { findPackage } from '@logto/shared';
import { deduplicate } from '@silverhand/essentials';
import chalk from 'chalk';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorFactory } from '#src/utils/connectors/types.js';

import { notImplemented } from './consts.js';
import {
  parseMetadata,
  validateConnectorModule,
  validateFormItemsAndConfigGuardConsistency,
} from './index.js';
import { loadConnector } from './loader.js';

const checkDuplicateConnectorFactoriesId = (connectorFactories: ConnectorFactory[]) => {
  const connectorFactoryIds = connectorFactories.map(({ metadata }) => metadata.id);
  const deduplicatedConnectorFactoryIds = deduplicate(connectorFactoryIds);

  if (connectorFactoryIds.length !== deduplicatedConnectorFactoryIds.length) {
    const duplicatedConnectorFactoryIds = deduplicatedConnectorFactoryIds.filter(
      (deduplicateId) => connectorFactoryIds.filter((id) => id === deduplicateId).length > 1
    );
    throw new RequestError({
      code: 'connector.more_than_one_connector_factory',
      status: 422,
      connectorIds: duplicatedConnectorFactoryIds.map((id) => `${id}`).join(', '),
    });
  }
};

// eslint-disable-next-line @silverhand/fp/no-let
let cachedConnectorFactories: ConnectorFactory[] | undefined;

export const loadConnectorFactories = async () => {
  if (cachedConnectorFactories) {
    checkDuplicateConnectorFactoriesId(cachedConnectorFactories);

    return cachedConnectorFactories;
  }

  const currentDirname = path.dirname(fileURLToPath(import.meta.url));
  const coreDirectory = await findPackage(currentDirname);
  const directory = coreDirectory && path.join(coreDirectory, connectorDirectory);

  if (!directory || !existsSync(directory)) {
    return [];
  }

  const connectorPackages = await getConnectorPackagesFromDirectory(directory);

  if (EnvSet.values.showConnectorLoadingErrorDetails) {
    console.log(`${chalk.red(`Detailed connector loading error message is enabled.`)}`);
  }

  const connectorFactories = await Promise.all(
    connectorPackages.map(async ({ path: packagePath, name }) => {
      try {
        const createConnector = await loadConnector(packagePath);
        const rawConnector = await createConnector({ getConfig: notImplemented });
        validateConnectorModule(rawConnector);

        if (!EnvSet.values.ignoreConnectorFormViewConfigGuardCheck) {
          validateFormItemsAndConfigGuardConsistency(
            rawConnector.configGuard,
            rawConnector.metadata.formItems
          );
        }

        return {
          metadata: await parseMetadata(rawConnector.metadata, packagePath),
          type: rawConnector.type,
          createConnector,
          path: packagePath,
        };
      } catch (error: unknown) {
        if (EnvSet.values.showConnectorLoadingErrorDetails) {
          console.log(
            `${chalk.red(
              `[load-connector] skip ${chalk.bold(name)} due to error: ${JSON.stringify(error)}`
            )}`
          );

          return;
        }

        if (error instanceof Error) {
          console.log(
            `${chalk.red(
              `[load-connector] skip ${chalk.bold(name)} due to error: ${error.message}`
            )}`
          );

          return;
        }

        throw error;
      }
    })
  );

  // eslint-disable-next-line @silverhand/fp/no-mutation
  cachedConnectorFactories = connectorFactories.filter(
    (connectorFactory): connectorFactory is ConnectorFactory => connectorFactory !== undefined
  );

  checkDuplicateConnectorFactoriesId(cachedConnectorFactories);

  return cachedConnectorFactories;
};
