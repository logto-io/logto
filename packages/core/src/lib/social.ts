import { User } from '@logto/schemas';
import { Nullable } from '@silverhand/essentials';
import { InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import { getLogtoConnectorById } from '@/connectors';
import { SocialUserInfo, socialUserInfoGuard } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import {
  findUserByEmail,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

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
  if (info.phone && (await hasUserWithPhone(info.phone))) {
    const user = await findUserByPhone(info.phone);

    return [{ type: 'phone', value: info.phone }, user];
  }

  if (info.email && (await hasUserWithEmail(info.email))) {
    const user = await findUserByEmail(info.email);

    return [{ type: 'email', value: info.email }, user];
  }

  return null;
};
