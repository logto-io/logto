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
  type OidcPrivateKey,
  LogtoOidcConfigKeyType,
  oidcSessionConfigGuard,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import defaults from '#src/oidc/defaults.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { exportJWK } from '#src/utils/jwks.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

import idTokenRoutes from './id-token.js';
import logtoConfigJwtCustomizerRoutes from './jwt-customizer.js';

/**
 * Provide a simple API router key type and DB config key mapping
 */
const getOidcConfigKeyDatabaseColumnName = (
  key: LogtoOidcConfigKeyType
): Exclude<LogtoOidcConfigKey, LogtoOidcConfigKey.Session> =>
  key === LogtoOidcConfigKeyType.PrivateKeys
    ? LogtoOidcConfigKey.PrivateKeys
    : LogtoOidcConfigKey.CookieKeys;

// Keep `ttl` constraints from `oidcSessionConfigGuard` while requiring this field in API responses.
const oidcSessionConfigResponseGuard = oidcSessionConfigGuard.required({ ttl: true });

/**
 * Remove actual values of the private keys from response.
 * @param type Logto config key DB column name. Values are either `oidc.privateKeys` or `oidc.cookieKeys`.
 * @param keys Logto OIDC private keys.
 * @returns Redacted Logto OIDC private keys without actual private key value.
 */
const getRedactedOidcKeyResponse = async (
  type: LogtoOidcConfigKey,
  keys: Array<OidcConfigKey | OidcPrivateKey>
): Promise<OidcConfigKeysResponse[]> =>
  Promise.all(
    keys.map(async ({ id, value, createdAt, ...rest }) => {
      if (type === LogtoOidcConfigKey.PrivateKeys) {
        const jwk = await exportJWK(crypto.createPrivateKey(value));
        const parseResult = oidcConfigKeysResponseGuard.safeParse({
          id,
          createdAt,
          signingKeyAlgorithm: jwk.kty,
          status: 'status' in rest ? rest.status : undefined,
        });
        if (!parseResult.success) {
          throw new RequestError({ code: 'request.general', status: 422 });
        }
        return parseResult.data;
      }
      return { id, createdAt };
    })
  );

export default function logtoConfigRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const { getAdminConsoleConfig, updateAdminConsoleConfig, updateOidcConfigsByKey } =
    tenant.queries.logtoConfigs;
  const { getOidcConfigs } = tenant.logtoConfigs;
  const { oidcPrivateKeys } = tenant.libraries;

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

  router.get(
    '/configs/oidc/session',
    koaGuard({
      response: oidcSessionConfigResponseGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const configs = await getOidcConfigs(getConsoleLogFromContext(ctx));
      const sessionConfig = configs[LogtoOidcConfigKey.Session];

      ctx.body = {
        // Add default TTL value if session config is not set.
        ttl: defaults.sessionTtl,
        ...sessionConfig,
      };

      // Intentionally do not call next() to avoid falling through to /configs/oidc/:keyType.
      // Running next() will trigger all the downstream middleware including the route handler for /configs/oidc/:keyType, which is not expected for this endpoint.
    }
  );

  router.patch(
    '/configs/oidc/session',
    koaGuard({
      body: oidcSessionConfigGuard.partial(),
      response: oidcSessionConfigResponseGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const configs = await getOidcConfigs(getConsoleLogFromContext(ctx));
      const sessionConfig = configs[LogtoOidcConfigKey.Session];

      const updatedSessionConfig = { ...sessionConfig, ...ctx.guard.body };

      await updateOidcConfigsByKey(LogtoOidcConfigKey.Session, updatedSessionConfig);
      void tenant.invalidateCache();

      ctx.body = {
        ttl: defaults.sessionTtl,
        ...updatedSessionConfig,
      };

      return next();
    }
  );

  router.get(
    '/configs/oidc/:keyType',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(LogtoOidcConfigKeyType),
      }),
      response: z.array(oidcConfigKeysResponseGuard),
      status: [200],
    }),
    async (ctx, next) => {
      const { keyType } = ctx.guard.params;
      const configKey = getOidcConfigKeyDatabaseColumnName(keyType);
      const configs = await getOidcConfigs(getConsoleLogFromContext(ctx));

      // Remove actual values of the private keys from response
      ctx.body = await getRedactedOidcKeyResponse(configKey, configs[configKey]);

      return next();
    }
  );

  router.delete(
    '/configs/oidc/:keyType/:keyId',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(LogtoOidcConfigKeyType),
        keyId: z.string(),
      }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const { keyType, keyId } = ctx.guard.params;
      const configKey = getOidcConfigKeyDatabaseColumnName(keyType);
      await (configKey === LogtoOidcConfigKey.PrivateKeys
        ? oidcPrivateKeys.deletePrivateSigningKey(keyId)
        : (async () => {
            const configs = await getOidcConfigs(getConsoleLogFromContext(ctx));
            const existingKeys = configs[configKey];

            if (existingKeys.length <= 1) {
              throw new RequestError({ code: 'oidc.key_required', status: 422 });
            }

            if (!existingKeys.some(({ id }) => id === keyId)) {
              throw new RequestError({ code: 'oidc.key_not_found', id: keyId, status: 404 });
            }

            await updateOidcConfigsByKey(
              configKey,
              existingKeys.filter(({ id }) => id !== keyId)
            );
          })());
      void tenant.invalidateCache();

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/configs/oidc/:keyType/rotate',
    koaGuard({
      params: z.object({
        keyType: z.nativeEnum(LogtoOidcConfigKeyType),
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

      const newPrivateKey =
        configKey === LogtoOidcConfigKey.PrivateKeys
          ? await generateOidcPrivateKey(signingKeyAlgorithm)
          : generateOidcCookieKey();

      const updatedKeys =
        configKey === LogtoOidcConfigKey.PrivateKeys
          ? await oidcPrivateKeys.rotatePrivateSigningKeys(newPrivateKey)
          : await (async () => {
              const configs = await getOidcConfigs(getConsoleLogFromContext(ctx));
              const existingKeys = configs[configKey];
              const updatedKeys = [newPrivateKey, ...existingKeys].slice(0, 2);
              await updateOidcConfigsByKey(configKey, updatedKeys);
              return updatedKeys;
            })();
      void tenant.invalidateCache();

      // Remove actual values of the private keys from response
      ctx.body = await getRedactedOidcKeyResponse(configKey, updatedKeys);

      return next();
    }
  );

  logtoConfigJwtCustomizerRoutes(router, tenant);

  idTokenRoutes(router, tenant);
}
