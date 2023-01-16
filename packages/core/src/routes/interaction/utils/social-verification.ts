import type { ConnectorSession, SetSessionMode, SocialUserInfo } from '@logto/connector-kit';
import type { SocialConnectorPayload } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import {
  getConnectorSessionResult,
  assignConnectorSessionResult,
} from '#src/routes/interaction/utils/interaction.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import type { SocialAuthorizationUrlPayload } from '../types/index.js';

export const createSocialAuthorizationUrl = async (
  ctx: WithLogContext,
  { provider, libraries }: TenantContext,
  payload: SocialAuthorizationUrlPayload
) => {
  const {
    connectors: { getLogtoConnectorById },
  } = libraries;

  const { connectorId, state, redirectUri } = payload;
  assertThat(state && redirectUri, 'session.insufficient_info');

  const connector = await getLogtoConnectorById(connectorId);

  assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');

  const {
    headers: { 'user-agent': userAgent },
  } = ctx.request;
  const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

  return connector.getAuthorizationUri(
    {
      state,
      redirectUri,
      /**
       * For upcoming POST /interaction/verification/assertion API, we need to block requests
       * for non-SAML connector (relies on connectorFactoryId) and use `connectorId`
       * to find correct connector config.
       *
       * TODO @darcy : add check on `connectorId` and `connectorFactoryId` existence and save logic
       * in SAML connector `getAuthorizationUri` method.
       */
      connectorId,
      connectorFactoryId: connector.metadata.id,
      jti,
      headers: { userAgent },
    },
    async (connectorStorage: ConnectorSession, mode: SetSessionMode) =>
      assignConnectorSessionResult(ctx, provider, connectorStorage, mode)
  );
};

export const verifySocialIdentity = async (
  { connectorId, connectorData }: SocialConnectorPayload,
  ctx: WithLogContext,
  { provider, libraries }: TenantContext
): Promise<SocialUserInfo> => {
  const {
    socials: { getUserInfoByAuthCode },
  } = libraries;

  const log = ctx.createLog('Interaction.SignIn.Identifier.Social.Submit');
  log.append({ connectorId, connectorData });

  const userInfo = await getUserInfoByAuthCode(
    connectorId,
    connectorData,
    async (preserveResult: Optional<boolean>) =>
      getConnectorSessionResult(ctx, provider, preserveResult)
  );

  log.append(userInfo);

  return userInfo;
};
