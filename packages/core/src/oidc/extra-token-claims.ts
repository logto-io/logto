import {
  type Json,
  LogtoJwtTokenKey,
  LogtoJwtTokenKeyType,
  LogResult,
  jwtCustomizer as jwtCustomizerLog,
  type CustomJwtFetcher,
  GrantType,
  CustomJwtErrorCode,
  jwtCustomizerUserInteractionContextGuard,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import {
  type AccessToken,
  errors,
  type KoaContextWithOIDC,
  type UnknownObject,
} from 'oidc-provider';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import { JwtCustomizerLibrary } from '#src/libraries/jwt-customizer.js';
import { type LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { parseCustomJwtResponseError } from '../utils/custom-jwt/index.js';

import { tokenExchangeActGuard } from './grants/token-exchange/types.js';

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

  const isAccessToken =
    token instanceof ctx.oidc.provider.AccessToken ||
    token instanceof ctx.oidc.provider.ClientCredentials;

  // Only handle access tokens
  if (!isAccessToken) {
    return;
  }

  return { organization_id: organizationId };
};

/**
 * The field `extra` in the access token will be overidden by the return value of `extraTokenClaims` function,
 * previously in token exchange grant, this field is used to save `act` data temporarily,
 * here we validate the data and return them again to prevent data loss.
 */
export const getExtraTokenClaimsForTokenExchange = async (
  ctx: KoaContextWithOIDC,
  token: unknown
): Promise<UnknownObject | undefined> => {
  const isAccessToken = token instanceof ctx.oidc.provider.AccessToken;

  // Only handle access tokens
  if (!isAccessToken) {
    return;
  }

  // Only handle token exchange grant type
  if (token.gty !== GrantType.TokenExchange) {
    return;
  }

  const result = tokenExchangeActGuard.safeParse(token.extra);

  if (!result.success) {
    return;
  }

  return result.data;
};

/**
 * Retrieves the user's lasted submitted interaction data from the OIDC session extension.
 *
 * @returns The formatted interaction data if available for the given session UID and account ID.
 *  Otherwise, returns `undefined`.
 *
 */
const getInteractionLastSubmission = async (
  queries: Queries,
  { accountId, sessionUid }: AccessToken
) => {
  // Session UID and account ID are required to fetch the interaction data.
  if (!accountId || !sessionUid) {
    return;
  }

  const { oidcSessionExtensions } = queries;
  const sessionExtension = await oidcSessionExtensions.findBySessionUid(sessionUid);
  if (!sessionExtension || sessionExtension.accountId !== accountId) {
    return;
  }

  const { lastSubmission } = sessionExtension;
  const interactionData = jwtCustomizerUserInteractionContextGuard.safeParse(lastSubmission);

  if (!interactionData.success) {
    return;
  }

  return interactionData.data;
};

/**
 * Safely retrieves the associated subject token for a given access token.
 *
 * - Only processes tokens issued via the Token Exchange grant type.
 * - Safely parses the `extra` field of the access token to extract the `subjectTokenId`.
 * - Fetches the subject token if the `subjectTokenId` is present and valid.
 */
const getAssociatedSubjectToken = async (queries: Queries, token: AccessToken) => {
  if (token.gty !== GrantType.TokenExchange) {
    return;
  }

  const tokenExtraResult = z
    .object({
      subjectTokenId: z.string(),
    })
    .safeParse(token.extra);

  if (!tokenExtraResult.success) {
    return;
  }

  return queries.subjectTokens.findSubjectToken(tokenExtraResult.data.subjectTokenId);
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

  const isClientCredentialsToken = token instanceof ctx.oidc.provider.ClientCredentials;

  try {
    /**
     * It is by design to use `trySafe` here to catch the error but not log it since we do not
     * want to insert an error log every time the OIDC provider issues a token when the JWT
     * customizer is not configured.
     */
    const { script, environmentVariables } =
      (await trySafe(
        logtoConfigs.getJwtCustomizer(
          isClientCredentialsToken
            ? LogtoJwtTokenKey.ClientCredentials
            : LogtoJwtTokenKey.AccessToken
        )
      )) ?? {};

    if (!script) {
      return;
    }

    // Pick only the fields that will be included in the token payload based on the token type.
    const pickedFields = isClientCredentialsToken
      ? ctx.oidc.provider.ClientCredentials.IN_PAYLOAD
      : ctx.oidc.provider.AccessToken.IN_PAYLOAD;

    const originalTokenPayload = Object.fromEntries(
      pickedFields
        .filter((field) => Reflect.get(token, field) !== undefined)
        .map((field) => [field, Reflect.get(token, field)])
    );

    // Fetch user info context for user access token.
    const logtoUserInfo = conditional(
      !isClientCredentialsToken &&
        token.accountId &&
        (await libraries.jwtCustomizers.getUserContext(token.accountId))
    );

    // Fetch user interaction context for user access token.
    const interactionContext = conditional(
      !isClientCredentialsToken && (await getInteractionLastSubmission(queries, token))
    );

    // Safely retrieve the associated subject token for user access token (Token Exchange grant type only).
    const subjectToken = conditional(
      !isClientCredentialsToken && (await getAssociatedSubjectToken(queries, token))
    );

    const payload: CustomJwtFetcher = {
      script,
      environmentVariables,
      token: originalTokenPayload,
      ...(isClientCredentialsToken
        ? { tokenType: LogtoJwtTokenKeyType.ClientCredentials }
        : {
            tokenType: LogtoJwtTokenKeyType.AccessToken,
            // TODO (LOG-8555): the newly added `UserProfile` type includes undefined fields and can not be directly assigned to `Json` type. And the `undefined` fields should be removed by zod guard.
            // `context` parameter is only eligible for user's access token for now.
            context: {
              // eslint-disable-next-line no-restricted-syntax
              user: logtoUserInfo as Record<string, Json>,
              ...conditional(
                subjectToken && {
                  grant: {
                    type: GrantType.TokenExchange,
                    subjectTokenContext: subjectToken.context,
                  },
                }
              ),
              ...conditional(
                interactionContext && {
                  interaction: interactionContext,
                }
              ),
            },
          }),
    };

    if (EnvSet.values.isCloud) {
      return await libraries.jwtCustomizers.runScriptRemotely(payload, ctx);
    }

    return await JwtCustomizerLibrary.runScriptInLocalVm(payload);
  } catch (error: unknown) {
    const entry = new LogEntry(
      `${jwtCustomizerLog.prefix}.${
        isClientCredentialsToken
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

    // If the error is an instance of `ResponseError`, we need to parse the customJwtError body to get the error code.
    if (error instanceof ResponseError) {
      const customJwtError = await trySafe(async () => parseCustomJwtResponseError(error));

      if (customJwtError?.code === CustomJwtErrorCode.AccessDenied) {
        throw new errors.AccessDenied(customJwtError.message);
      }
    }
  }
};
/* eslint-enable complexity */
