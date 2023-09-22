import type { LogtoOidcConfigType, LogtoSamlSigningKeyPair } from '@logto/schemas';
import {
  cloudApiIndicator,
  cloudConnectionDataGuard,
  logtoOidcConfigGuard,
  logtoSamlSigningKeyPairGuard,
  LogtoOidcConfigKey,
} from '@logto/schemas';
import chalk from 'chalk';
import { z, ZodError } from 'zod';

import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { consoleLog } from '#src/utils/console.js';
import { generateSamlKeyPair } from '#src/utils/saml.js';

export type LogtoConfigLibrary = ReturnType<typeof createLogtoConfigLibrary>;

export const createLogtoConfigLibrary = ({
  logtoConfigs: {
    getRowsByKeys,
    getCloudConnectionData: queryCloudConnectionData,
    getSamlSigningKeyPair: querySamlSigningKeyPair,
    insertSamlSigningKeyPair,
  },
}: Pick<Queries, 'logtoConfigs'>) => {
  const getOidcConfigs = async (): Promise<LogtoOidcConfigType> => {
    try {
      const { rows } = await getRowsByKeys(Object.values(LogtoOidcConfigKey));

      return z
        .object(logtoOidcConfigGuard)
        .parse(Object.fromEntries(rows.map(({ key, value }) => [key, value])));
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        consoleLog.error(
          error.issues
            .map(({ message, path }) => `${message} at ${chalk.green(path.join('.'))}`)
            .join('\n')
        );
      } else {
        consoleLog.error(error);
      }

      consoleLog.error(
        `\nFailed to get OIDC configs from your Logto database.` +
          ' Did you forget to seed your database?\n\n' +
          `  Use ${chalk.green('npm run cli db seed')} to seed your Logto database;\n` +
          `  Or use ${chalk.green('npm run cli db seed oidc')} to seed OIDC configs alone.\n`
      );
      throw new Error('Failed to get configs');
    }
  };

  const getCloudConnectionData = async () => {
    const { value } = await queryCloudConnectionData();
    const result = cloudConnectionDataGuard.safeParse(value);

    if (!result.success) {
      throw new Error('Failed to get cloud connection data!');
    }

    return {
      appId: result.data.appId,
      appSecret: result.data.appSecret,
      resource: cloudApiIndicator,
    };
  };

  /* We will generate a pair of RSA keys for SAML for each tenant up on SAML IdP creation request. */
  const getSamlSigningKeyPair = async (): Promise<LogtoSamlSigningKeyPair> => {
    const signingKeyPair = await querySamlSigningKeyPair();

    if (signingKeyPair) {
      return signingKeyPair;
    }

    // Generate one if not exists
    const keyPair = generateSamlKeyPair();
    const { value } = await insertSamlSigningKeyPair(keyPair);

    const result = logtoSamlSigningKeyPairGuard.safeParse(value);
    assertThat(result.success, new Error('Failed to generate SAML signing key pair'));

    return result.data;
  };

  return { getOidcConfigs, getCloudConnectionData, getSamlSigningKeyPair };
};
