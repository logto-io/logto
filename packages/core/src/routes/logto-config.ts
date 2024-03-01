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
  LogtoOidcConfigKeyType,
  LogtoJwtTokenKeyType,
  jwtCustomizerAccessTokenGuard,
  jwtCustomizerClientCredentialsGuard,
  LogtoJwtTokenKey,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard, { tryParse } from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { exportJWK } from '#src/utils/jwks.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

/**
 * Provide a simple API router key type and DB config key mapping
 */
const getOidcConfigKeyDatabaseColumnName = (key: LogtoOidcConfigKeyType): LogtoOidcConfigKey =>
  key === LogtoOidcConfigKeyType.PrivateKeys
    ? LogtoOidcConfigKey.PrivateKeys
    : LogtoOidcConfigKey.CookieKeys;

const getLogtoJwtTokenKey = (key: LogtoJwtTokenKeyType): LogtoJwtTokenKey =>
  key === LogtoJwtTokenKeyType.AccessToken
    ? LogtoJwtTokenKey.AccessToken
    : LogtoJwtTokenKey.ClientCredentials;

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
  ...[router, { queries, logtoConfigs, invalidateCache }]: RouterInitArgs<T>
) {
  const {
    getAdminConsoleConfig,
    getRowsByKeys,
    insertJwtCustomizer,
    updateAdminConsoleConfig,
    updateOidcConfigsByKey,
  } = queries.logtoConfigs;
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
      const configs = await getOidcConfigs();

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
      void invalidateCache();

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
      void invalidateCache();

      // Remove actual values of the private keys from response
      ctx.body = await getRedactedOidcKeyResponse(configKey, updatedKeys);

      return next();
    }
  );

  router.post(
    '/configs/jwt-customizer/:tokenType',
    koaGuard({
      params: z.object({
        tokenType: z.nativeEnum(LogtoJwtTokenKeyType),
      }),
      /**
       * Use `z.unknown()` to guard the request body as a JSON object, since the actual guard depends
       * on the `tokenType` and we can not get the value of `tokenType` before parsing the request body,
       * we will do more specific guard as long as we can get the value of `tokenType`.
       */
      body: z.unknown(),
      response: jwtCustomizerAccessTokenGuard.or(jwtCustomizerClientCredentialsGuard),
      status: [201, 400, 409],
    }),
    async (ctx, next) => {
      const {
        params: { tokenType },
        body,
      } = ctx.guard;

      // Manually implement the request body type check, the flow aligns with the actual `koaGuard()`.
      // Use ternary operator to get the specific guard brings difficulties to type inference.
      if (tokenType === LogtoJwtTokenKeyType.AccessToken) {
        tryParse('body', jwtCustomizerAccessTokenGuard, body);
      } else {
        tryParse('body', jwtCustomizerClientCredentialsGuard, body);
      }

      const { rows } = await getRowsByKeys([getLogtoJwtTokenKey(tokenType)]);
      assertThat(
        rows.length === 0,
        new RequestError({
          code: 'logto_config.jwt.customizer_exists',
          tokenType,
          status: 409,
        })
      );

      const jwtCustomizer = await insertJwtCustomizer(
        getLogtoJwtTokenKey(tokenType),
        // Since we applied the detailed guard manually, we can safely cast the `body` to the specific type.
        // eslint-disable-next-line no-restricted-syntax
        body as Parameters<typeof insertJwtCustomizer>[1]
      );

      ctx.status = 201;
      ctx.body = jwtCustomizer.value;

      return next();
    }
  );
}
