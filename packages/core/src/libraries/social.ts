import { appInsights } from '@logto/app-insights/node';
import type { GetSession, SocialUserInfo } from '@logto/connector-kit';
import { socialUserInfoGuard } from '@logto/connector-kit';
import type { EncryptedTokenSet, SecretSocialConnectorRelationPayload, User } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { trySafe, type Nullable } from '@silverhand/essentials';
import type { InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { assertNoAuthorizationError } from '#src/utils/connectors/authorization-error.js';
import { describeTransportFailure } from '#src/utils/connectors/transport-failure.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';
import { getConsoleLogFromContext, unknownConsole } from '#src/utils/console.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';
import {
  deserializeEncryptedSecret,
  encryptAndSerializeTokenResponse,
  encryptTokenResponse,
  isValidAccessTokenResponse,
} from '#src/utils/secret-encryption.js';

/**
 * Run a call to the social provider made through the connector.
 *
 * The connectors map the provider's HTTP errors to `ConnectorError`s, but a request that fails at
 * the transport level (timeout, connection reset, DNS failure, TLS error) is rethrown as it is and
 * used to surface as a 500 "Internal server error.", indistinguishable from a bug in Logto. Such a
 * failure is relayed as a 502 instead, so the caller can tell "the provider is unreachable" from
 * "Logto is broken". The response only carries the network code: the request's method and URL go
 * to the server log, since the endpoint of an OIDC / OAuth 2.0 connector is admin-configured and
 * may be an internal host.
 */
const callSocialProvider = async <T>(
  connectorId: string,
  run: () => Promise<T>,
  ctx?: WithLogContext
): Promise<T> => {
  try {
    return await run();
  } catch (error: unknown) {
    const failure = describeTransportFailure(error);

    if (!failure) {
      throw error;
    }

    const { code, method, url } = failure;
    const consoleLog = ctx ? getConsoleLogFromContext(ctx) : unknownConsole;
    consoleLog.warn(
      `Social provider unreachable (${code}) for connector ${connectorId}: ${[method, url]
        .filter(Boolean)
        .join(' ')}`
    );

    throw new RequestError(
      { code: 'connector.social_provider_unreachable', status: 502, reason: code },
      { code, connectorId }
    );
  }
};

const getUserInfoFromInteractionResult = async (
  connectorId: string,
  interactionResult: InteractionResults
): Promise<SocialUserInfo> => {
  const parse = z
    .object({
      socialUserInfo: z.object({
        connectorId: z.string(),
        userInfo: socialUserInfoGuard,
      }),
    })
    .safeParse(interactionResult);

  if (!parse.success) {
    throw new RequestError('session.connector_session_not_found');
  }

  const result = parse.data;
  assertThat(result.socialUserInfo.connectorId === connectorId, 'session.connector_id_mismatch');

  return result.socialUserInfo.userInfo;
};

export const createSocialLibrary = (queries: Queries, connectorLibrary: ConnectorLibrary) => {
  const { findUserByEmail, findUserByNormalizedPhone } = queries.users;
  const { getLogtoConnectorById } = connectorLibrary;

  const getConnector = async (connectorId: string): Promise<LogtoConnector> => {
    try {
      return await getLogtoConnectorById(connectorId);
    } catch (error: unknown) {
      // Throw a new error with status 422 when connector not found.
      if (error instanceof RequestError && error.code === 'entity.not_found') {
        throw new RequestError({
          code: 'session.invalid_connector_id',
          status: 422,
          connectorId,
        });
      }
      throw error;
    }
  };

  const getUserInfo = async (
    connectorId: string,
    data: unknown,
    getConnectorSession: GetSession
  ): Promise<SocialUserInfo> => {
    const connector = await getConnector(connectorId);

    assertThat(
      connector.type === ConnectorType.Social,
      new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        connectorId,
      })
    );

    assertNoAuthorizationError(data);

    return callSocialProvider(connectorId, async () =>
      connector.getUserInfo(data, getConnectorSession)
    );
  };

  /**
   * Retrieves user information from a social connector, and optionally includes the token response.
   *
   * @remarks
   * If the connector supports and has enabled token storage,
   * this function returns both the user info and the token response from the social provider.
   * Otherwise return the userInfo only.
   */
  const getUserInfoWithOptionalTokenResponse = async (
    connectorId: string,
    data: unknown,
    getConnectorSession: GetSession,
    ctx?: WithLogContext
  ): Promise<{
    userInfo: SocialUserInfo;
    encryptedTokenSet?: EncryptedTokenSet;
  }> => {
    const connector = await getConnector(connectorId);

    assertThat(
      connector.type === ConnectorType.Social,
      new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        connectorId,
      })
    );

    const {
      metadata: { isTokenStorageSupported },
      dbEntry: { enableTokenStorage },
      getUserInfo,
      getTokenResponseAndUserInfo,
    } = connector;

    assertNoAuthorizationError(data);

    if (enableTokenStorage && isTokenStorageSupported && getTokenResponseAndUserInfo) {
      const { userInfo, tokenResponse } = await callSocialProvider(
        connectorId,
        async () => getTokenResponseAndUserInfo(data, getConnectorSession),
        ctx
      );

      // Only store the token response if it contains an access token.
      if (!tokenResponse?.access_token) {
        return {
          userInfo,
        };
      }

      const encryptedTokenSet = trySafe(
        () => encryptAndSerializeTokenResponse(tokenResponse),
        (error) => {
          // If the token response cannot be encrypted, we log the error but continue to return user info.
          void appInsights.trackException(error, ctx ? buildAppInsightsTelemetry(ctx) : undefined);
        }
      );

      return {
        userInfo,
        encryptedTokenSet,
      };
    }

    return {
      userInfo: await callSocialProvider(
        connectorId,
        async () => getUserInfo(data, getConnectorSession),
        ctx
      ),
    };
  };

  /**
   * Find user by phone/email from social user info.
   * if both phone and email exist, take phone for priority.
   *
   * @param info SocialUserInfo
   * @returns null | [string, User] the first string indicating phone or email
   */
  const findSocialRelatedUser = async (
    info: SocialUserInfo
  ): Promise<Nullable<[{ type: 'email' | 'phone'; value: string }, User]>> => {
    if (info.phone) {
      const user = await findUserByNormalizedPhone(info.phone);

      if (user) {
        return [{ type: 'phone', value: info.phone }, user];
      }
    }

    if (info.email) {
      const user = await findUserByEmail(info.email);

      if (user) {
        return [{ type: 'email', value: info.email }, user];
      }
    }

    return null;
  };

  const upsertSocialTokenSetSecret = async (
    userId: string,
    {
      encryptedTokenSet,
      socialConnectorRelationPayload,
    }: {
      encryptedTokenSet: EncryptedTokenSet;
      socialConnectorRelationPayload: SecretSocialConnectorRelationPayload;
    }
  ) => {
    const { encryptedTokenSetBase64, metadata } = encryptedTokenSet;

    return queries.secrets.upsertSocialTokenSetSecret(
      {
        id: generateStandardId(),
        userId,
        ...deserializeEncryptedSecret(encryptedTokenSetBase64),
        metadata,
      },
      socialConnectorRelationPayload
    );
  };

  /**
   * Refreshes the token set secret by using the provided refresh token.
   *
   * - Fetches the latest token response using the refresh token.
   * - Updates the secret using the latest encrypted token response.
   * - Returns the access token and metadata from the updated secret.
   */
  const refreshTokenSetSecret = async (
    connectorId: string,
    secretId: string,
    refreshToken: string
  ) => {
    const connector = await getConnector(connectorId);

    assertThat(
      connector.type === ConnectorType.Social,
      new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        connectorId,
      })
    );

    const {
      metadata: { isTokenStorageSupported },
      dbEntry: { enableTokenStorage },
      getAccessTokenByRefreshToken,
    } = connector;

    assertThat(
      isTokenStorageSupported && enableTokenStorage && getAccessTokenByRefreshToken,
      new RequestError({
        code: 'connector.token_storage_not_supported',
        status: 422,
      })
    );

    const tokenResponse = await callSocialProvider(connectorId, async () =>
      getAccessTokenByRefreshToken(refreshToken)
    );

    assertThat(
      isValidAccessTokenResponse(tokenResponse),
      new RequestError('connector.invalid_response')
    );

    // This is to ensure that the refresh token is included in the updated token response.
    // For some providers like Google, the refresh token is issued only once during the initial authorization.
    // We need keep the original refresh token in the updated token response.
    // If new refresh token is returned, it will replace the original one.
    const updatedTokenResponse: typeof tokenResponse = {
      refresh_token: refreshToken,
      ...tokenResponse,
    };

    const { tokenSecret, metadata } = encryptTokenResponse(updatedTokenResponse);
    const { access_token } = updatedTokenResponse;

    await queries.secrets.updateById(secretId, {
      ...tokenSecret,
      metadata,
    });

    return {
      access_token,
      metadata,
    };
  };

  return {
    getConnector,
    getUserInfo,
    getUserInfoWithOptionalTokenResponse,
    getUserInfoFromInteractionResult,
    findSocialRelatedUser,
    upsertSocialTokenSetSecret,
    refreshTokenSetSecret,
  };
};
