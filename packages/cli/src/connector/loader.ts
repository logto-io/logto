import path from 'node:path';

import type { AllConnector, CreateConnector } from '@logto/connector-kit';
import connectorKitMeta from '@logto/connector-kit/package.json' assert { type: 'json' };
import { satisfies } from 'semver';

import { isKeyInObject } from './utils.js';

const connectorKit = '@logto/connector-kit';
const { version: currentVersion } = connectorKitMeta;

const checkConnectorKitVersion = (dependencies: unknown, ignoreVersionMismatch: boolean) => {
  if (isKeyInObject(dependencies, connectorKit)) {
    const value = dependencies[connectorKit];

    if (typeof value === 'string') {
      if (value.startsWith('workspace:') || satisfies(currentVersion, value)) {
        return;
      }

      const message = `Connector requires ${connectorKit} to be ${value}, but the version here is ${currentVersion}.`;

      if (ignoreVersionMismatch) {
        console.warn(`[warn] ${message}\n\nThis is highly discouraged in production.`);

        return;
      }

      throw new Error(message);
    }
  }

  throw new Error(`Cannot find ${connectorKit} in connector's dependency`);
};

export const loadConnector = async (
  connectorPath: string,
  ignoreVersionMismatch: boolean
): Promise<CreateConnector<AllConnector>> => {
  const {
    default: { dependencies },
    // eslint-disable-next-line no-restricted-syntax
  } = (await import(path.join(connectorPath, 'package.json'), {
    assert: { type: 'json' },
  })) as { default: Record<string, unknown> };

  checkConnectorKitVersion(dependencies, ignoreVersionMismatch);

  const loaded: unknown = await import(path.join(connectorPath, 'lib/index.js'));

  if (isKeyInObject(loaded, 'default')) {
    // CJS pattern
    if (isKeyInObject(loaded.default, 'default')) {
      if (typeof loaded.default.default === 'function') {
        console.log(`[warn] Load connector ${connectorPath} in CJS mode`);

        // eslint-disable-next-line no-restricted-syntax
        return loaded.default.default as CreateConnector<AllConnector>;
      }
      // ESM pattern
    } else if (typeof loaded.default === 'function') {
      // eslint-disable-next-line no-restricted-syntax
      return loaded.default as CreateConnector<AllConnector>;
    }
  }

  throw new Error(
    `Cannot load connector from ${connectorPath}, the connector package may be broken.`
  );
};
