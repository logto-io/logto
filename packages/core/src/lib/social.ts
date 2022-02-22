import { User } from '@logto/schemas';
import { InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import { getSocialConnectorInstanceById } from '@/connectors';
import { SocialUserInfo, socialUserInfoGuard } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import {
  findUserByEmail,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

export interface SocialUserInfoSession {
  connectorId: string;
  userInfo: SocialUserInfo;
}

const getConnector = async (connectorId: string) => {
  try {
    return await getSocialConnectorInstanceById(connectorId);
  } catch (error: unknown) {
    // Throw a new error with status 422 when connector not found.
    if (error instanceof RequestError && error.code === 'entity.not_found') {
      throw new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        data: { connectorId },
      });
    }
    throw error;
  }
};

export const getUserInfoByAuthCode = async (
  connectorId: string,
  authCode: string
): Promise<SocialUserInfo> => {
  const connector = await getConnector(connectorId);
  const accessToken = await connector.getAccessToken(authCode);

  return connector.getUserInfo(accessToken);
};

export const getUserInfoFromInteractionResult = async (
  connectorId: string,
  interactionResult?: InteractionResults
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
 * @returns null | [string, User] the first string idicating phone or email
 */
export const findSocialRelatedUser = async (
  info: SocialUserInfo
): Promise<null | [string, User]> => {
  if (info.phone && (await hasUserWithPhone(info.phone))) {
    const user = await findUserByPhone(info.phone);

    return [info.phone, user];
  }

  if (info.email && (await hasUserWithEmail(info.email))) {
    const user = await findUserByEmail(info.email);

    return [info.email, user];
  }

  return null;
};
