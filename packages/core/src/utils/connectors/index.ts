import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import type { AllConnector, BaseConnector, GetConnectorConfig } from '@logto/connector-kit';
import { ConnectorError, ConnectorErrorCodes, ConnectorType } from '@logto/connector-kit';

import { notImplemented } from './consts.js';
import type { ConnectorFactory } from './types.js';

export function validateConnectorModule(
  connector: Partial<BaseConnector<ConnectorType>>
): asserts connector is BaseConnector<ConnectorType> {
  if (!connector.metadata) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidMetadata);
  }

  if (!connector.configGuard) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfigGuard);
  }

  if (!connector.type || !Object.values(ConnectorType).includes(connector.type)) {
    throw new ConnectorError(ConnectorErrorCodes.UnexpectedType);
  }
}

export const readUrl = async (
  url: string,
  baseUrl: string,
  type: 'text' | 'svg'
): Promise<string> => {
  if (!url) {
    return url;
  }

  if (type !== 'text' && url.startsWith('http')) {
    return url;
  }

  if (!existsSync(path.join(baseUrl, url))) {
    return url;
  }

  if (type === 'svg') {
    const data = await readFile(path.join(baseUrl, url));

    return `data:image/svg+xml;base64,${data.toString('base64')}`;
  }

  return readFile(path.join(baseUrl, url), 'utf8');
};

export const parseMetadata = async (
  metadata: AllConnector['metadata'],
  packagePath: string
): Promise<AllConnector['metadata']> => {
  return {
    ...metadata,
    logo: await readUrl(metadata.logo, packagePath, 'svg'),
    logoDark: metadata.logoDark && (await readUrl(metadata.logoDark, packagePath, 'svg')),
    readme: await readUrl(metadata.readme, packagePath, 'text'),
    configTemplate:
      metadata.configTemplate && (await readUrl(metadata.configTemplate, packagePath, 'text')),
  };
};

export const buildRawConnector = async (
  connectorFactory: ConnectorFactory,
  getConnectorConfig?: GetConnectorConfig
) => {
  const { createConnector, path: packagePath } = connectorFactory;
  const rawConnector = await createConnector({
    getConfig: getConnectorConfig ?? notImplemented,
  });
  validateConnectorModule(rawConnector);
  const rawMetadata = await parseMetadata(rawConnector.metadata, packagePath);

  return { rawConnector, rawMetadata };
};
