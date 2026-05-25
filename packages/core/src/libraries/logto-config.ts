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
  adminTenantId,
  cloudApiIndicator,
  cloudConnectionDataGuard,
  getOidcProviderPrivateKeys,
  normalizeOidcPrivateKeys,
  oidcConfigKeysResponseGuard,
  rotateOidcPrivateKeyStatuses,
  idTokenConfigGuard,
  jwtCustomizerConfigGuard,
  logtoOidcConfigGuard,
} from '@logto/schemas';
import { type ConsoleLog, type GlobalValues, TtlCache } from '@logto/shared';
import { appendPath, isKeyInObject } from '@silverhand/essentials';
import { type DatabasePool } from '@silverhand/slonik';
import chalk from 'chalk';
import { type JWK } from 'jose';
import ky from 'ky';
import { ZodError, z } from 'zod';

import { getTenantEndpoint } from '#src/env-set/utils.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  createLogtoConfigQueries,
  getAdminTenantPrivateSigningKeys,
} from '#src/queries/logto-config.js';
import type Queries from '#src/tenants/Queries.js';
import { exportJWK } from '#src/utils/jwks.js';

const adminTenantJwksCache = new TtlCache<string, JWK[]>(60 * 60 * 1000); // 1 hour

export type LogtoConfigLibrary = ReturnType<typeof createLogtoConfigLibrary>;

type CreateLogtoConfigLibraryArgs = Pick<Queries, 'logtoConfigs' | 'pool' | 'wellKnownCache'> & {
  /**
   * Process-wide shared pool used for cross-tenant reads (currently: the admin tenant's
   * OIDC keys). Injected here so this library doesn't statically depend on `EnvSet`,
   * which would create an `env-set <-> libraries/logto-config` import cycle.
   */
  adminSharedPool: Promise<DatabasePool>;
  /** Snapshot of global env values; used to decide deployment mode and resolve URLs. */
  envValues: GlobalValues;
};

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
  adminSharedPool,
  envValues,
}: CreateLogtoConfigLibraryArgs) => {
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

  /**
   * Resolve the admin tenant's public signing keys and issuer so user tenants can validate
   * access tokens issued by the admin tenant.
   *
   * - In single-tenant (OSS) deployments, read `oidc.privateKeys` from `logto_configs`
   *   directly and derive public JWKs locally. This avoids a self-HTTP request to
   *   `<admin>/oidc/.well-known/openid-configuration`, which breaks behind reverse proxies
   *   that don't resolve the admin endpoint from inside the container (#6048), and
   *   propagates signing key rotations to user tenants without waiting for the HTTP cache.
   * - In multi-tenant deployments, fall back to OIDC discovery + the public JWKS endpoint
   *   (cached per-process for one hour), since user tenants may not share a database
   *   connection with the admin tenant.
   *
   * The DB-read path returns the canonical `[Current, Next, Previous]` key set, matching
   * what the admin tenant's `/oidc/jwks` endpoint exposes during staged rotation.
   */
  const getAdminTenantTokenValidationSet = async (): Promise<{
    keys: JWK[];
    issuer: string[];
  }> => {
    const { isMultiTenancy, adminUrlSet } = envValues;

    if (!isMultiTenancy && adminUrlSet.deduplicated().length === 0) {
      return { keys: [], issuer: [] };
    }

    const issuer = appendPath(
      isMultiTenancy ? getTenantEndpoint(adminTenantId, envValues) : adminUrlSet.endpoint,
      '/oidc'
    );

    if (!isMultiTenancy) {
      const adminPool = await adminSharedPool;
      const privateKeys = getOidcProviderPrivateKeys(
        await getAdminTenantPrivateSigningKeys(adminPool)
      ).map(({ value }) => crypto.createPrivateKey(value));
      const publicKeys = privateKeys.map((key) => crypto.createPublicKey(key));

      return {
        keys: await Promise.all(publicKeys.map(async (key) => exportJWK(key))),
        issuer: [issuer.href],
      };
    }

    const cached = adminTenantJwksCache.get(issuer.href);

    if (cached) {
      return { keys: cached, issuer: [issuer.href] };
    }

    const configuration = await ky
      .get(appendPath(issuer, '/.well-known/openid-configuration'))
      .json();

    if (!isKeyInObject(configuration, 'jwks_uri')) {
      return { keys: [], issuer: [] };
    }

    const jwks = await ky.get(String(configuration.jwks_uri)).json<{ keys: JWK[] }>();

    if (!isKeyInObject(jwks, 'keys') || !Array.isArray(jwks.keys)) {
      return { keys: [], issuer: [] };
    }

    adminTenantJwksCache.set(issuer.href, jwks.keys);

    return { keys: jwks.keys, issuer: [issuer.href] };
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
    getAdminTenantTokenValidationSet,
  };
};
