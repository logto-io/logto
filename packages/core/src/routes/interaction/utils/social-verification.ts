import type { SocialConnectorPayload, LogType } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import type { SocialUserInfo } from '#src/connectors/types.js';
import { getUserInfoByAuthCode } from '#src/libraries/social.js';
import type { LogContext } from '#src/middleware/koa-log.js';
import assertThat from '#src/utils/assert-that.js';

import type { SocialAuthorizationUrlPayload } from '../types/index.js';

export const createSocialAuthorizationUrl = async (payload: SocialAuthorizationUrlPayload) => {
  const { connectorId, state, redirectUri } = payload;
  assertThat(state && redirectUri, 'session.insufficient_info');

  const connector = await getLogtoConnectorById(connectorId);

  assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');

  // FIXME: @Darcy
  // @ts-expect-error pending fix
  return connector.getAuthorizationUri({ state, redirectUri });
};

export const verifySocialIdentity = async (
  { connectorId, connectorData }: SocialConnectorPayload,
  log: LogContext['log']
): Promise<SocialUserInfo> => {
  const logType: LogType = 'SignInSocial';
  log(logType, { connectorId, connectorData });

  const userInfo = await getUserInfoByAuthCode(connectorId, connectorData);

  log(logType, userInfo);

  return userInfo;
};
