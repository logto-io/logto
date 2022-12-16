import type { SocialConnectorPayload } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import type { SocialUserInfo } from '#src/connectors/types.js';
import { getUserInfoByAuthCode } from '#src/libraries/social.js';
import type { LogContext } from '#src/middleware/koa-audit-log.js';
import assertThat from '#src/utils/assert-that.js';

import type { SocialAuthorizationUrlPayload } from '../types/index.js';

export const createSocialAuthorizationUrl = async (payload: SocialAuthorizationUrlPayload) => {
  const { connectorId, state, redirectUri } = payload;
  assertThat(state && redirectUri, 'session.insufficient_info');

  const connector = await getLogtoConnectorById(connectorId);

  assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');

  return connector.getAuthorizationUri({ state, redirectUri });
};

export const verifySocialIdentity = async (
  { connectorId, connectorData }: SocialConnectorPayload,
  log: LogContext['log']
): Promise<SocialUserInfo> => {
  log.setKey('SignIn.SocialId.Social.Create');
  log({ connectorId, connectorData });

  const userInfo = await getUserInfoByAuthCode(connectorId, connectorData);

  log(userInfo);

  return userInfo;
};
