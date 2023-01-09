import type { ConnectorSession, SocialUserInfo } from '@logto/connector-kit';
import type { SocialConnectorPayload } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import type Provider from 'oidc-provider';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import { getUserInfoByAuthCode } from '#src/libraries/social.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import {
  getConnectorSessionResult,
  assignConnectorSessionResult,
} from '#src/routes/interaction/utils/interaction.js';
import assertThat from '#src/utils/assert-that.js';

import type { SocialAuthorizationUrlPayload } from '../types/index.js';

export const createSocialAuthorizationUrl = async (
  ctx: WithLogContext,
  provider: Provider,
  payload: SocialAuthorizationUrlPayload
) => {
  const { connectorId, state, redirectUri } = payload;
  assertThat(state && redirectUri, 'session.insufficient_info');

  const connector = await getLogtoConnectorById(connectorId);

  assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');

  const {
    headers: { 'user-agent': userAgent },
  } = ctx.request;

  return connector.getAuthorizationUri(
    { state, redirectUri, headers: { userAgent } },
    async (connectorStorage: ConnectorSession) =>
      assignConnectorSessionResult(ctx, provider, connectorStorage)
  );
};

export const verifySocialIdentity = async (
  { connectorId, connectorData }: SocialConnectorPayload,
  ctx: WithLogContext,
  provider: Provider
): Promise<SocialUserInfo> => {
  const log = ctx.createLog('Interaction.SignIn.Identifier.Social.Submit');
  log.append({ connectorId, connectorData });

  const userInfo = await getUserInfoByAuthCode(connectorId, connectorData, async () =>
    getConnectorSessionResult(ctx, provider)
  );

  log.append(userInfo);

  return userInfo;
};
