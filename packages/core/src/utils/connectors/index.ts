import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ConnectorFactory } from '@logto/cli/lib/connector/index.js';
import { loadConnectorFactories as _loadConnectorFactories } from '@logto/cli/lib/connector/index.js';
import { connectorDirectory } from '@logto/cli/lib/constants.js';
import { getConnectorPackagesFromDirectory } from '@logto/cli/lib/utils.js';
import { demoConnectorIds } from '@logto/connector-kit';
import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { findPackage } from '@logto/shared';
import { deduplicate, pick } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import type { LogtoConnector } from './types.js';

export const transpileLogtoConnector = ({
  dbEntry,
  metadata,
  type,
}: LogtoConnector): ConnectorResponse => {
  const isDemo = demoConnectorIds.includes(dbEntry.connectorId);
  const { config } = dbEntry;

  return {
    type,
    ...metadata,
    ...pick(dbEntry, 'id', 'connectorId', 'syncProfile', 'metadata'),
    isDemo,
    // Hide demo connector config
    config: isDemo ? {} : config,
  };
};

export const transpileConnectorFactory = ({
  metadata,
  type,
}: ConnectorFactory): ConnectorFactoryResponse => {
  return { type, ...metadata, isDemo: demoConnectorIds.includes(metadata.id) };
};

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

export const loadConnectorFactories = async () => {
  const currentDirname = path.dirname(fileURLToPath(import.meta.url));
  const cliDirectory = await findPackage(currentDirname);
  const coreDirectory = cliDirectory && path.join(cliDirectory, '../core');
  const directory = coreDirectory && path.join(coreDirectory, connectorDirectory);

  if (!directory || !existsSync(directory)) {
    return [];
  }

  const connectorPackages = await getConnectorPackagesFromDirectory(directory);

  const connectorFactories = await _loadConnectorFactories(
    connectorPackages,
    EnvSet.values.isIntegrationTest || EnvSet.values.ignoreConnectorVersionCheck
  );

  checkDuplicateConnectorFactoriesId(connectorFactories);

  return connectorFactories;
};
