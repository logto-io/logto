import crypto from 'node:crypto';

import type {
  CloudConnectionData,
  IdTokenConfig,
  JwtCustomizerType,
  LogtoOidcConfigType,
  OidcConfigKey,
  OidcConfigKeysResponse,
  OidcPrivateKey,
} from '@logto/schemas';
import {
  LogtoConfigs,
  LogtoJwtTokenKey,
  LogtoOidcConfigKey,
  OidcSigningKeyStatus,
  cloudApiIndicator,
  cloudConnectionDataGuard,
  normalizeOidcPrivateKeys,
  oidcConfigKeysResponseGuard,
  rotateOidcPrivateKeyStatuses,
  idTokenConfigGuard,
  jwtCustomizerConfigGuard,
  logtoOidcConfigGuard,
} from '@logto/schemas';
import { type ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import { ZodError, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { createLogtoConfigQueries } from '#src/queries/logto-config.js';
import type Queries from '#src/tenants/Queries.js';
import { exportJWK } from '#src/utils/jwks.js';

export type LogtoConfigLibrary = ReturnType<typeof createLogtoConfigLibrary>;

export const createLogtoConfigLibrary = ({
  logtoConfigs: {
    getRowsByKeys,
    getCloudConnectionData: queryCloudConnectionData,
    upsertJwtCustomizer: queryUpsertJwtCustomizer,
    upsertIdTokenConfig: queryUpsertIdTokenConfig,
    getSigningKeyRotationState,
  },
  pool,
  wellKnownCache,
}: Pick<Queries, 'logtoConfigs' | 'pool' | 'wellKnownCache'>) => {
  const getOidcConfigs = async (consoleLog: ConsoleLog): Promise<LogtoOidcConfigType> => {
    try {
      const { rows } = await getRowsByKeys(Object.values(LogtoOidcConfigKey));
      const configs = z
        .object(logtoOidcConfigGuard)
        .parse(Object.fromEntries(rows.map(({ key, value }) => [key, value])));

      return {
        ...configs,
        [LogtoOidcConfigKey.PrivateKeys]: normalizeOidcPrivateKeys(
          configs[LogtoOidcConfigKey.PrivateKeys]
        ),
      };
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

  const getCloudConnectionData = async (): Promise<CloudConnectionData> => {
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

  // Can not narrow down the type of value if we utilize `buildInsertIntoWithPool` method.
  const upsertJwtCustomizer = async <T extends LogtoJwtTokenKey>(
    key: T,
    value: z.infer<(typeof jwtCustomizerConfigGuard)[T]>
  ) => {
    const { value: rawValue } = await queryUpsertJwtCustomizer(key, value);

    return {
      key,
      value: jwtCustomizerConfigGuard[key].parse(rawValue),
    };
  };

  const getJwtCustomizer = async <T extends LogtoJwtTokenKey>(key: T) => {
    const { rows } = await getRowsByKeys([key]);

    // If the record does not exist (`rows` is empty)
    if (rows.length === 0) {
      throw new RequestError({
        code: 'entity.not_exists_with_id',
        name: LogtoConfigs.tableSingular,
        id: key,
        status: 404,
      });
    }

    return z.object({ value: jwtCustomizerConfigGuard[key] }).parse(rows[0]).value;
  };

  const getJwtCustomizers = async (consoleLog: ConsoleLog): Promise<Partial<JwtCustomizerType>> => {
    try {
      const { rows } = await getRowsByKeys(Object.values(LogtoJwtTokenKey));

      return z
        .object(jwtCustomizerConfigGuard)
        .partial()
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

      throw new Error('Failed to get JWT customizers');
    }
  };

  const updateJwtCustomizer = async <T extends LogtoJwtTokenKey>(
    key: T,
    value: JwtCustomizerType[T]
  ): Promise<JwtCustomizerType[T]> => {
    const originValue = await getJwtCustomizer(key);
    const result = jwtCustomizerConfigGuard[key].parse({ ...originValue, ...value });
    const updatedRow = await upsertJwtCustomizer(key, result);
    return updatedRow.value;
  };

  const upsertIdTokenConfig = async (idTokenConfig: IdTokenConfig) => {
    const { value } = await queryUpsertIdTokenConfig(idTokenConfig);
    return idTokenConfigGuard.parse(value);
  };

  /**
   * Remove key material before returning OIDC keys through the management API.
   * For private signing keys, also attach the scheduled effective time from the
   * persisted rotation state to the staged Next key.
   */
  const getRedactedOidcKeyResponse = async (
    type: LogtoOidcConfigKey,
    keys: Array<OidcConfigKey | OidcPrivateKey>
  ): Promise<OidcConfigKeysResponse[]> => {
    const signingKeyRotationState =
      type === LogtoOidcConfigKey.PrivateKeys ? await getSigningKeyRotationState() : undefined;

    return Promise.all(
      keys.map(async ({ id, value, createdAt, ...rest }) => {
        if (type === LogtoOidcConfigKey.PrivateKeys) {
          const jwk = await exportJWK(crypto.createPrivateKey(value));
          const status = 'status' in rest ? rest.status : undefined;
          const parseResult = oidcConfigKeysResponseGuard.safeParse({
            id,
            createdAt,
            effectiveAt:
              status === OidcSigningKeyStatus.Next
                ? signingKeyRotationState?.signingKeyRotationAt
                : undefined,
            signingKeyAlgorithm: jwk.kty,
            status,
          });

          if (!parseResult.success) {
            throw new RequestError({ code: 'request.general', status: 422 });
          }

          return parseResult.data;
        }

        return { id, createdAt };
      })
    );
  };

  /**
   * Rotate OIDC private signing key statuses if the scheduled rotation time has come.
   * This function is intended to be called before accessing OIDC configs to ensure the key statuses are up-to-date.
   */
  const promoteScheduledSigningKeyRotation = async () => {
    await pool.transaction(async (connection) => {
      const transactionalQueries = createLogtoConfigQueries(connection, wellKnownCache);
      await transactionalQueries.lockPrivateSigningKeysAndRotationState();

      const rotationState = await transactionalQueries.getSigningKeyRotationState();

      if (!rotationState?.signingKeyRotationAt || rotationState.signingKeyRotationAt > Date.now()) {
        return;
      }

      const privateKeys = await transactionalQueries.getPrivateSigningKeys();
      const updatedPrivateKeys = rotateOidcPrivateKeyStatuses(privateKeys);

      // Skip rewriting the row when there is no staged Next key to promote.
      if (updatedPrivateKeys === privateKeys) {
        return;
      }

      await transactionalQueries.upsertPrivateSigningKeys(updatedPrivateKeys);
    });
  };

  return {
    getOidcConfigs,
    getCloudConnectionData,
    upsertJwtCustomizer,
    getJwtCustomizer,
    getJwtCustomizers,
    updateJwtCustomizer,
    upsertIdTokenConfig,
    getRedactedOidcKeyResponse,
    promoteScheduledSigningKeyRotation,
  };
};
