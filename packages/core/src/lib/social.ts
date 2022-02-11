import { InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import { getSocialConnectorInstanceById } from '@/connectors';
import { SocialUserInfo, socialUserInfoGuard } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
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

export const getUserInfoByConnectorCode = async (
  connectorId: string,
  code: string
): Promise<SocialUserInfo> => {
  const connector = await getConnector(connectorId);
  const accessToken = await connector.getAccessToken(code);

  return connector.getUserInfo(accessToken);
};

export const getUserInfoFromInteractionResult = async (
  connectorId: string,
  interactionResult?: InteractionResults
): Promise<SocialUserInfo> => {
  const result = z
    .object({
      socialUserInfo: z.object({
        connectorId: z.string(),
        userInfo: socialUserInfoGuard,
      }),
    })
    .parse(interactionResult);

  assertThat(result.socialUserInfo.connectorId === connectorId, 'session.insufficient_info');

  return result.socialUserInfo.userInfo;
};
