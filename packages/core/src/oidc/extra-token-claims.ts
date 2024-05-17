import {
  type Json,
  LogtoJwtTokenKey,
  LogtoJwtTokenKeyType,
  LogResult,
  jwtCustomizer as jwtCustomizerLog,
  type CustomJwtFetcher,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';
import { type KoaContextWithOIDC, type UnknownObject } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import { JwtCustomizerLibrary } from '#src/libraries/jwt-customizer.js';
import { type LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

/**
 * For organization API resource feature, add extra token claim `organization_id` to the
 * access token.
 * Note that this is available only when `resource` and `organization_id` are both present.
 */
export const getExtraTokenClaimsForOrganizationApiResource = async (
  ctx: KoaContextWithOIDC,
  token: unknown
): Promise<UnknownObject | undefined> => {
  const organizationId = ctx.oidc.params?.organization_id;
  const resource = ctx.oidc.params?.resource;

  if (!organizationId || !resource) {
    return;
  }

  const isAccessToken = token instanceof ctx.oidc.provider.AccessToken;

  // Only handle access tokens
  if (!isAccessToken) {
    return;
  }

  return { organization_id: organizationId };
};

/* eslint-disable complexity */
export const getExtraTokenClaimsForJwtCustomization = async (
  ctx: KoaContextWithOIDC,
  token: unknown,
  {
    envSet,
    queries,
    libraries,
    logtoConfigs,
    cloudConnection,
  }: {
    envSet: EnvSet;
    queries: Queries;
    libraries: Libraries;
    logtoConfigs: LogtoConfigLibrary;
    cloudConnection: CloudConnectionLibrary;
  }
): Promise<UnknownObject | undefined> => {
  // Narrow down the token type to `AccessToken` and `ClientCredentials`.
  if (
    !(token instanceof ctx.oidc.provider.AccessToken) &&
    !(token instanceof ctx.oidc.provider.ClientCredentials)
  ) {
    return;
  }

  const isTokenClientCredentials = token instanceof ctx.oidc.provider.ClientCredentials;

  try {
    /**
     * It is by design to use `trySafe` here to catch the error but not log it since we do not
     * want to insert an error log every time the OIDC provider issues a token when the JWT
     * customizer is not configured.
     */
    const { script, environmentVariables } =
      (await trySafe(
        logtoConfigs.getJwtCustomizer(
          isTokenClientCredentials
            ? LogtoJwtTokenKey.ClientCredentials
            : LogtoJwtTokenKey.AccessToken
        )
      )) ?? {};

    if (!script) {
      return;
    }

    const pickedFields = isTokenClientCredentials
      ? ctx.oidc.provider.ClientCredentials.IN_PAYLOAD
      : ctx.oidc.provider.AccessToken.IN_PAYLOAD;
    const readOnlyToken = Object.fromEntries(
      pickedFields
        .filter((field) => Reflect.get(token, field) !== undefined)
        .map((field) => [field, Reflect.get(token, field)])
    );

    // We pass context to the cloud API only when it is a user's access token.
    const logtoUserInfo = conditional(
      !isTokenClientCredentials &&
        token.accountId &&
        (await libraries.jwtCustomizers.getUserContext(token.accountId))
    );

    const payload: CustomJwtFetcher = {
      script,
      environmentVariables,
      token: readOnlyToken,
      ...(isTokenClientCredentials
        ? { tokenType: LogtoJwtTokenKeyType.ClientCredentials }
        : {
            tokenType: LogtoJwtTokenKeyType.AccessToken,
            // TODO (LOG-8555): the newly added `UserProfile` type includes undefined fields and can not be directly assigned to `Json` type. And the `undefined` fields should be removed by zod guard.
            // `context` parameter is only eligible for user's access token for now.
            // eslint-disable-next-line no-restricted-syntax
            context: { user: logtoUserInfo as Record<string, Json> },
          }),
    };

    if (EnvSet.values.isCloud) {
      const client = await cloudConnection.getClient();
      return await client.post(`/api/services/custom-jwt`, {
        body: payload,
        search: {},
      });
    }
    return await JwtCustomizerLibrary.runScriptInLocalVm(payload);
  } catch (error: unknown) {
    const entry = new LogEntry(
      `${jwtCustomizerLog.prefix}.${
        isTokenClientCredentials
          ? jwtCustomizerLog.Type.ClientCredentials
          : jwtCustomizerLog.Type.AccessToken
      }`
    );
    entry.append({
      result: LogResult.Error,
      error: { message: String(error) },
    });
    const { payload } = entry;
    await queries.logs.insertLog({
      id: generateStandardId(),
      key: payload.key,
      payload: {
        ...payload,
        tenantId: envSet.tenantId,
        token,
      },
    });
  }
};
/* eslint-enable complexity */
