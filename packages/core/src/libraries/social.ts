import { appInsights } from '@logto/app-insights/node';
import type { GetSession, SocialUserInfo } from '@logto/connector-kit';
import { socialUserInfoGuard } from '@logto/connector-kit';
import type { EncryptedTokenSet, SecretSocialConnectorRelationPayload, User } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { ConsoleLog, generateStandardId } from '@logto/shared';
import { trySafe, type Nullable } from '@silverhand/essentials';
import chalk from 'chalk';
import type { InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

import { deserializeEncryptedSecret, encryptTokenResponse } from '../utils/secret-encryption.js';

const consoleLog = new ConsoleLog(chalk.magenta('Social'));

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
    consoleLog.info('[Social] Debug: Attempting to get connector with ID:', connectorId);
    try {
      const connector = await getLogtoConnectorById(connectorId);
      consoleLog.info('[Social] Debug: Successfully retrieved connector:', {
        id: connector.dbEntry.id,
        type: connector.type,
        metadataId: connector.metadata.id,
        target: connector.metadata.target,
      });
      return connector;
    } catch (error: unknown) {
      consoleLog.error(
        '[Social] Error: Failed to get connector with ID:',
        connectorId,
        'Error:',
        error
      );
      // Throw a new error with status 422 when connector not found.
      if (error instanceof RequestError && error.code === 'entity.not_found') {
        throw new RequestError({
          code: 'session.invalid_connector_id',
          status: 422,
          connectorId,
          details: `Connector with ID "${connectorId}" not found in database`,
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
        details: `Connector "${connectorId}" is not a Social connector (type: ${connector.type})`,
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

      const encryptedTokenSet = trySafe(
        () => encryptTokenResponse(tokenResponse),
        (error) => {
          // If the token response cannot be encrypted, we log the error but continue to return user info.
          void appInsights.trackException(error);
        }
      );

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
