import path from 'path';

import connectorKitMeta from '@logto/connector-kit/package.json' assert { type: 'json' };
import { satisfies } from 'semver';

const connectorKit = '@logto/connector-kit';
const { version: currentVersion } = connectorKitMeta;

export const checkConnectorKitVersion = async (connectorPath: string) => {
  const {
    default: { dependencies },
    // eslint-disable-next-line no-restricted-syntax
  } = (await import(path.join(connectorPath, 'package.json'), {
    assert: { type: 'json' },
  })) as { default: Record<string, unknown> };

  if (dependencies !== null && typeof dependencies === 'object' && connectorKit in dependencies) {
    const value = dependencies[connectorKit];

    if (typeof value === 'string') {
      if (satisfies(currentVersion, value)) {
        return;
      }

      throw new Error(
        `Connector requires ${connectorKit} to be ${value}, but the version here is ${currentVersion}.`
      );
    }
  }

  throw new Error(`Cannot find ${connectorKit} in connector's dependency`);
};
