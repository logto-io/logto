import crypto from 'node:crypto';

import {
  generateOidcCookieKey,
  generateOidcPrivateKey,
} from '@logto/cli/lib/commands/database/utils.js';
import {
  LogtoOidcConfigKey,
  adminConsoleDataGuard,
  oidcConfigKeysResponseGuard,
  SupportedSigningKeyAlgorithm,
  type OidcConfigKeysResponse,
  type OidcConfigKey,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { exportJWK } from '#src/utils/jwks.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

/*
 * Logto OIDC private key type used in API routes
 */
enum LogtoOidcPrivateKeyType {
  PrivateKeys = 'private-keys',
  CookieKeys = 'cookie-keys',
}

/**
 * Provide a simple API router key type and DB column mapping
 */
const getOidcConfigKeyDatabaseColumnName = (key: LogtoOidcPrivateKeyType): LogtoOidcConfigKey =>
  key === LogtoOidcPrivateKeyType.PrivateKeys
    ? LogtoOidcConfigKey.PrivateKeys
    : LogtoOidcConfigKey.CookieKeys;

/**
 * Remove actual values of the private keys from response.
 * @param type Logto config key DB column name. Values are either `oidc.privateKeys` or `oidc.cookieKeys`.
 * @param keys Logto OIDC private keys.
 * @returns Redacted Logto OIDC private keys without actual private key value.
 */
const getRedactedOidcKeyResponse = async (
  type: LogtoOidcConfigKey,
  keys: OidcConfigKey[]
): Promise<OidcConfigKeysResponse[]> =>
  Promise.all(
    keys.map(async ({ id, value, createdAt }) => {
      if (type === LogtoOidcConfigKey.PrivateKeys) {
        const jwk = await exportJWK(crypto.createPrivateKey(value));
        const parseResult = oidcConfigKeysResponseGuard.safeParse({
          id,
          createdAt,
          signingKeyAlgorithm: jwk.kty,
        });
        if (!parseResult.success) {
          throw new RequestError({ code: 'request.general', status: 422 });
        }
        return parseResult.data;
      }
      return { id, createdAt };
    })
  );

export default function logtoConfigRoutes<T extends AuthedRouter>(
  ...[router, { queries, logtoConfigs, envSet }]: RouterInitArgs<T>
) {
  const { getAdminConsoleConfig, updateAdminConsoleConfig, updateOidcConfigsByKey } =
    queries.logtoConfigs;
  const { getOidcConfigs } = logtoConfigs;

  router.get(
    '/configs/admin-console',
    koaGuard({ response: adminConsoleDataGuard, status: [200, 404] }),
    async (ctx, next) => {
      const { value } = await getAdminConsoleConfig();
      ctx.body = value;

      return next();
    }
  );

  router.patch(
    '/configs/admin-console',
    koaGuard({
      body: adminConsoleDataGuard.partial(),
      response: adminConsoleDataGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { value } = await updateAdminConsoleConfig(ctx.guard.body);
      ctx.body = value;

      return next();
    }
  );

  /**
   * Get Logto OIDC private keys from database. The actual key will be redacted from the result.
   * @param keyType Logto OIDC private key type. Values are either `private-keys` or `cookie-keys`.
   */
  router.get(
    '/configs/oidc/:keyType',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(LogtoOidcPrivateKeyType),
      }),
      response: z.array(oidcConfigKeysResponseGuard),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { keyType } = ctx.guard.params;
      const configKey = getOidcConfigKeyDatabaseColumnName(keyType);
      const configs = await getOidcConfigs();

      // Remove actual values of the private keys from response
      ctx.body = await getRedactedOidcKeyResponse(configKey, configs[configKey]);

      return next();
    }
  );

  /**
   * Delete a Logto OIDC private key from database.
   * @param keyType Logto OIDC key type. Values are either `oidc.privateKeys` or `oidc.cookieKeys`.
   * @param keyId The ID of the private key to be deleted.
   */
  router.delete(
    '/configs/oidc/:keyType/:keyId',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(LogtoOidcPrivateKeyType),
        keyId: z.string(),
      }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { keyType, keyId } = ctx.guard.params;
      const configKey = getOidcConfigKeyDatabaseColumnName(keyType);
      const configs = await getOidcConfigs();
      const existingKeys = configs[configKey];

      if (existingKeys.length <= 1) {
        throw new RequestError({ code: 'oidc.key_required', status: 422 });
      }

      if (!existingKeys.some(({ id }) => id === keyId)) {
        throw new RequestError({ code: 'oidc.key_not_found', id: keyId, status: 404 });
      }

      const updatedKeys = existingKeys.filter(({ id }) => id !== keyId);

      await updateOidcConfigsByKey(configKey, updatedKeys);

      // Reload OIDC configs in envSet in order to apply the changes immediately
      await envSet.load();

      ctx.status = 204;

      return next();
    }
  );

  /**
   * Rotate Logto OIDC private keys. A new key will be generated and added to the list of private keys.
   * Only keep the last 2 recent keys. The oldest key will be automatically removed if the list exceeds 2 keys.
   * @param configKey Logto OIDC key type. Values are either `oidc.privateKeys` or `oidc.cookieKeys`.
   * @param signingKeyAlgorithm The signing key algorithm the new generated private key is using. Values are either `EC` or `RSA`. Only applicable to `oidc.privateKeys`. Defaults to `EC`.
   */
  router.post(
    '/configs/oidc/:keyType/rotate',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(LogtoOidcPrivateKeyType),
      }),
      body: z.object({
        signingKeyAlgorithm: z.nativeEnum(SupportedSigningKeyAlgorithm).optional(),
      }),
      response: z.array(oidcConfigKeysResponseGuard),
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { keyType } = ctx.guard.params;
      const { signingKeyAlgorithm } = ctx.guard.body;
      const configKey = getOidcConfigKeyDatabaseColumnName(keyType);
      const configs = await getOidcConfigs();
      const existingKeys = configs[configKey];

      const newPrivateKey =
        configKey === LogtoOidcConfigKey.PrivateKeys
          ? await generateOidcPrivateKey(signingKeyAlgorithm)
          : generateOidcCookieKey();

      // Clamp and only keep the 2 most recent private keys.
      // Also make sure the new key is always on top of the list.
      const updatedKeys = [newPrivateKey, ...existingKeys].slice(0, 2);

      await updateOidcConfigsByKey(configKey, updatedKeys);

      // Reload OIDC configs in envSet in order to apply the changes immediately
      await envSet.load();

      // Remove actual values of the private keys from response
      ctx.body = await getRedactedOidcKeyResponse(configKey, updatedKeys);

      return next();
    }
  );
}
