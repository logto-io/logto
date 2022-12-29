import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import type { AllConnector, BaseConnector } from '@logto/connector-kit';
import { ConnectorError, ConnectorErrorCodes, ConnectorType } from '@logto/connector-kit';

import RequestError from '#src/errors/RequestError/index.js';
import { findAllConnectors } from '#src/queries/connector.js';
import assertThat from '#src/utils/assert-that.js';

export const getConnectorConfig = async (id: string): Promise<unknown> => {
  const connectors = await findAllConnectors();
  const connector = connectors.find((connector) => connector.id === id);

  assertThat(connector, new RequestError({ code: 'entity.not_found', id, status: 404 }));

  return connector.config;
};

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

type UrlType = 'text' | 'svg' | 'png' | 'jpeg' | undefined;

const getUrlType = (url: string): UrlType => {
  const splitUrl = url.split('/').filter(Boolean);

  assertThat(
    splitUrl.length > 1,
    new ConnectorError(ConnectorErrorCodes.InvalidMetadata, { message: `Invalid url: ${url}.` })
  );

  const splitBaseUrl = splitUrl.slice(-1)[0]?.split('.').filter(Boolean);
  const extension = splitBaseUrl && splitBaseUrl.length > 1 ? splitBaseUrl.slice(-1)[0] : undefined;

  if (!extension) {
    return undefined; // Short circuit for parsed URL.
  }

  if (extension === 'png' || extension === 'svg') {
    return extension;
  }

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'jpeg';
  }

  if (extension === 'md' || extension === 'json' || extension === 'txt') {
    return 'text';
  }

  throw new ConnectorError(ConnectorErrorCodes.InvalidMetadata, {
    message: `Invalid url: ${url} with unsupported file type.`,
  });
};

export const readUrl = async (url: string, baseUrl: string, type?: UrlType): Promise<string> => {
  if (!url) {
    return url;
  }

  const urlType = type ?? getUrlType(url);

  if (!urlType || (urlType !== 'text' && url.startsWith('http'))) {
    return url;
  }

  if (!existsSync(path.join(baseUrl, url))) {
    return url;
  }

  if (urlType === 'svg' || urlType === 'jpeg' || urlType === 'png') {
    const data = await readFile(path.join(baseUrl, url));

    const imageTypes = urlType === 'svg' ? 'svg+xml' : urlType;

    return `data:image/${imageTypes};base64,${data.toString('base64')}`;
  }

  return readFile(path.join(baseUrl, url), 'utf8');
};

export const parseMetadata = async (metadata: AllConnector['metadata'], packagePath: string) => {
  return {
    ...metadata,
    logo: await readUrl(metadata.logo, packagePath),
    logoDark: metadata.logoDark && (await readUrl(metadata.logoDark, packagePath)),
    readme: await readUrl(metadata.readme, packagePath, 'text'),
    configTemplate: await readUrl(metadata.configTemplate, packagePath, 'text'),
  };
};
