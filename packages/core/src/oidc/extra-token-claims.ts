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
  type InteractionEvent,
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
 * Converts InteractionStorage format to JwtCustomizerUserInteractionContext format
 */
const convertInteractionStorageToJwtCustomizerContext = (
  interactionStorage: unknown
):
  | { interactionEvent: InteractionEvent; userId: string; verificationRecords: unknown[] }
  | undefined => {
  if (!interactionStorage || typeof interactionStorage !== 'object') {
    return;
  }

  // eslint-disable-next-line no-restricted-syntax
  const storage = interactionStorage as Record<string, unknown>;
  const { interactionEvent, userId, verificationRecords } = storage;

  if (
    !interactionEvent ||
    typeof interactionEvent !== 'string' ||
    !userId ||
    typeof userId !== 'string' ||
    !Array.isArray(verificationRecords)
  ) {
    return;
  }

  return {
    // eslint-disable-next-line no-restricted-syntax
    interactionEvent: interactionEvent as InteractionEvent,
    userId,
    verificationRecords: verificationRecords.map((record: unknown) => {
      if (!record || typeof record !== 'object') {
        return { id: '', type: '', verified: false, identifier: undefined };
      }
      // eslint-disable-next-line no-restricted-syntax
      const recordObject = record as Record<string, unknown>;
      return {
        id: recordObject.id,
        type: recordObject.type,
        verified: Boolean(recordObject.verified),
        identifier: recordObject.identifier,
      };
    }),
  };
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

  // First try to parse as JwtCustomizerUserInteractionContext (legacy format)
  const legacyInteractionData = jwtCustomizerUserInteractionContextGuard.safeParse(lastSubmission);

  if (legacyInteractionData.success) {
    return legacyInteractionData.data;
  }

  // If that fails, try to convert from InteractionStorage format (new experience API format)
  const convertedInteractionData = convertInteractionStorageToJwtCustomizerContext(lastSubmission);

  if (convertedInteractionData) {
    // Validate the converted data
    const validatedData =
      jwtCustomizerUserInteractionContextGuard.safeParse(convertedInteractionData);

    if (validatedData.success) {
      return validatedData.data;
    }
  }
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

    const interactionContext = isTokenClientCredentials
      ? undefined
      : await getInteractionLastSubmission(queries, token);

    const subjectTokenResult = z
      .object({
        subjectTokenId: z.string(),
      })
      .safeParse(token.extra);
    const subjectToken =
      isTokenClientCredentials || token.gty !== GrantType.TokenExchange
        ? undefined
        : subjectTokenResult.success
          ? await queries.subjectTokens.findSubjectToken(subjectTokenResult.data.subjectTokenId)
          : undefined;

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
