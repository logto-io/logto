import type { User } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import type { InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import type { SocialUserInfo } from '#src/connectors/types.js';
import { socialUserInfoGuard } from '#src/connectors/types.js';
import RequestError from '#src/errors/RequestError/index.js';
import { findUserByEmail, findUserByPhone } from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

export type SocialUserInfoSession = {
  connectorId: string;
  userInfo: SocialUserInfo;
};

const getConnector = async (connectorId: string) => {
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

export const getUserInfoByAuthCode = async (
  connectorId: string,
  data: unknown
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

  // FIXME: @Darcy
  // @ts-expect-error pending fix
  return connector.getUserInfo(data);
};

export const getUserInfoFromInteractionResult = async (
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

/**
 * Find user by phone/email from social user info.
 * if both phone and email exist, take phone for priority.
 *
 * @param info SocialUserInfo
 * @returns null | [string, User] the first string indicating phone or email
 */
export const findSocialRelatedUser = async (
  info: SocialUserInfo
): Promise<Nullable<[{ type: 'email' | 'phone'; value: string }, User]>> => {
  if (info.phone) {
    const user = await findUserByPhone(info.phone);

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
