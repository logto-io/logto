import path from 'path';

import type { AllConnector, CreateConnector } from '@logto/connector-kit';
import connectorKitMeta from '@logto/connector-kit/package.json' assert { type: 'json' };
import { isKeyInObject } from '@logto/shared';
import { satisfies } from 'semver';

import { EnvSet } from '#src/env-set/index.js';

const connectorKit = '@logto/connector-kit';
const { version: currentVersion } = connectorKitMeta;

const checkConnectorKitVersion = (dependencies: unknown) => {
  if (isKeyInObject(dependencies, connectorKit)) {
    const value = dependencies[connectorKit];

    if (typeof value === 'string') {
      if (satisfies(currentVersion, value)) {
        return;
      }

      const message = `Connector requires ${connectorKit} to be ${value}, but the version here is ${currentVersion}.`;

      // Temporarily disable connector-kit version check for non-production env.
      if (!EnvSet.values.isProduction) {
        console.log(`[warn] ` + message);

        return;
      }

      throw new Error(message);
    }
  }

  throw new Error(`Cannot find ${connectorKit} in connector's dependency`);
};

export const loadConnector = async (
  connectorPath: string
): Promise<CreateConnector<AllConnector>> => {
  const {
    default: { dependencies },
    // eslint-disable-next-line no-restricted-syntax
  } = (await import(path.join(connectorPath, 'package.json'), {
    assert: { type: 'json' },
  })) as { default: Record<string, unknown> };

  checkConnectorKitVersion(dependencies);

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
