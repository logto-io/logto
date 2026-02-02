import { appInsights } from '@logto/app-insights/node';
import {
  type Json,
  LogtoJwtTokenKey,
  LogtoJwtTokenKeyType,
  LogResult,
  jwtCustomizer as jwtCustomizerLog,
  type CustomJwtFetcher,
  GrantType,
  jwtCustomizerSessionContextGuard,
  jwtCustomizerUserInteractionContextGuard,
} from '@logto/schemas';
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
import { JwtCustomizerLibrary } from '#src/libraries/jwt-customizer.js';
import { type LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { type LogEntry, type WithLogContext } from '#src/middleware/koa-audit-log.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { isAccessDeniedError, parseCustomJwtResponseError } from '#src/utils/custom-jwt/index.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import { tokenExchangeActGuard } from './grants/token-exchange/types.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getSessionContextFromLastSubmission = (value: unknown): unknown => {
  if (!isRecord(value)) {
    return;
  }

  return value.sessionContext;
};

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
  const sessionContextData = jwtCustomizerSessionContextGuard.safeParse(
    getSessionContextFromLastSubmission(lastSubmission)
  );

  if (!interactionData.success) {
    return;
  }

  return {
    interactionContext: interactionData.data,
    ...conditional(sessionContextData.success && { sessionContext: sessionContextData.data }),
  };
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
  ctx: KoaContextWithOIDC & WithLogContext,
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

  const customTokenClaimsLogEntries = new Set<LogEntry>();

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
    const interactionSubmission = conditional(
      !isClientCredentialsToken && (await getInteractionLastSubmission(queries, token))
    );
    const interactionContext = interactionSubmission?.interactionContext;
    const sessionContext = interactionSubmission?.sessionContext;

    // Safely retrieve the associated subject token for user access token (Token Exchange grant type only).
    const subjectToken = conditional(
      !isClientCredentialsToken && (await getAssociatedSubjectToken(queries, token))
    );

    const logEntry = ctx.createLog(
      `${jwtCustomizerLog.prefix}.${
        isClientCredentialsToken
          ? jwtCustomizerLog.Type.ClientCredentials
          : jwtCustomizerLog.Type.AccessToken
      }`
    );

    customTokenClaimsLogEntries.add(logEntry);

    logEntry.append({
      sessionId: ctx.oidc.session?.uid,
      applicationId: ctx.oidc.client?.clientId,
      ...conditional(logtoUserInfo && { userId: logtoUserInfo.id }),
      tenantId: envSet.tenantId,
    });

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
              ...conditional(
                sessionContext && {
                  // eslint-disable-next-line no-restricted-syntax
                  session: sessionContext as Record<string, Json>,
                }
              ),
            },
          }),
    };

    // DOT not log custom script and environment variables for security reason.
    const { script: _script, environmentVariables: _environmentVariables, ...logPayload } = payload;
    logEntry.append({
      payload: logPayload,
    });

    const result = EnvSet.values.isCloud
      ? await libraries.jwtCustomizers.runScriptRemotely(payload)
      : await JwtCustomizerLibrary.runScriptInLocalVm(payload);

    ctx.prependAllLogEntries({ customTokenClaims: result });

    return result;
  } catch (error: unknown) {
    void appInsights.trackException(error, buildAppInsightsTelemetry(ctx));

    for (const logEntry of customTokenClaimsLogEntries) {
      logEntry.append({
        result: LogResult.Error,
      });
    }

    if (error instanceof ResponseError) {
      const errorResponse = await trySafe(async () => parseCustomJwtResponseError(error));
      ctx.prependAllLogEntries({ customJwtError: errorResponse });

      // Deny the token exchange request if access is denied by the custom JWT script.
      if (errorResponse && isAccessDeniedError(errorResponse.error)) {
        throw new errors.AccessDenied(errorResponse.message);
      }
    } else {
      ctx.prependAllLogEntries({ customJwtError: String(error) });
    }
  }
};
/* eslint-enable complexity */
