import { appInsights } from '@logto/app-insights/node';
import type { GetSession, SocialUserInfo, TokenResponse } from '@logto/connector-kit';
import { socialUserInfoGuard } from '@logto/connector-kit';
import type { EncryptedTokenSet, SecretSocialConnectorRelationPayload, User } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, type Nullable } from '@silverhand/essentials';
import type { InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

import {
  deserializeEncryptedSecret,
  encryptTokens,
  serializeEncryptedSecret,
} from '../utils/secret-encryption.js';

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

const encryptTokenResponse = (tokenResponse?: TokenResponse): EncryptedTokenSet | undefined => {
  if (!tokenResponse?.access_token) {
    return;
  }

  try {
    const {
      access_token,
      id_token,
      refresh_token,
      scope,
      token_type: tokenType,
      expires_in,
    } = tokenResponse;

    const requestedAt = Math.floor(Date.now() / 1000);

    const expiresAt = expires_in && requestedAt + expires_in;

    const encryptedTokenSet = encryptTokens({
      access_token,
      ...conditional(id_token && { id_token }),
      ...conditional(refresh_token && { refresh_token }),
    });

    return {
      encryptedTokenSetBase64: serializeEncryptedSecret(encryptedTokenSet),
      metadata: {
        scope,
        tokenType,
        expiresAt,
      },
    };
  } catch (error: unknown) {
    // Token encryption should not break the normal social authentication flow
    // Return undefined to indicate no token response is available
    void appInsights.trackException(error);
  }
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

    return connector.getUserInfo(data, getConnectorSession);
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
    getConnectorSession: GetSession
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

    if (enableTokenStorage && isTokenStorageSupported && getTokenResponseAndUserInfo) {
      const { userInfo, tokenResponse } = await getTokenResponseAndUserInfo(
        data,
        getConnectorSession
      );

      const encryptedTokenSet = encryptTokenResponse(tokenResponse);

      return {
        userInfo,
        encryptedTokenSet,
      };
    }

    return {
      userInfo: await getUserInfo(data, getConnectorSession),
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

    try {
      await queries.secrets.upsertSocialTokenSetSecret(
        {
          id: generateStandardId(),
          userId,
          ...deserializeEncryptedSecret(encryptedTokenSetBase64),
          metadata,
        },
        socialConnectorRelationPayload
      );
    } catch (error: unknown) {
      // Upsert token set secret should not break the normal social authentication and link flow
      void appInsights.trackException(error);
    }
  };

  return {
    getConnector,
    getUserInfo,
    getUserInfoWithOptionalTokenResponse,
    getUserInfoFromInteractionResult,
    findSocialRelatedUser,
    upsertSocialTokenSetSecret,
  };
};
