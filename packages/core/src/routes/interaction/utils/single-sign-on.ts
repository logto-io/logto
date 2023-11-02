import { type ConnectorSession, ConnectorError, type SocialUserInfo } from '@logto/connector-kit';
import { validateRedirectUrl } from '@logto/core-kit';
import { type UserSsoIdentity } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import OidcConnector from '#src/sso/OidcConnector/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { type SupportedSsoConnector } from '#src/sso/types/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { type WithInteractionHooksContext } from '../middleware/koa-interaction-hooks.js';

import { assignConnectorSessionResult, getConnectorSessionResult } from './social-verification.js';

export const oidcAuthorizationUrlPayloadGuard = z.object({
  state: z.string().min(1),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
});

type OidcAuthorizationUrlPayload = z.infer<typeof oidcAuthorizationUrlPayloadGuard>;

export const getSsoAuthorizationUrl = async (
  ctx: WithLogContext,
  { provider }: TenantContext,
  connectorData: SupportedSsoConnector,
  payload?: OidcAuthorizationUrlPayload
): Promise<string> => {
  const { id: connectorId, providerName } = connectorData;

  const { createLog } = ctx;

  const log = createLog(`Interaction.SignIn.Identifier.SingleSignOn.Create`);
  log.append({
    connectorId,
    payload,
  });

  try {
    // Will throw ConnectorError if the config is invalid
    const connectorInstance = new ssoConnectorFactories[providerName].constructor(connectorData);

    if (connectorInstance instanceof OidcConnector) {
      // Only required for OIDC
      assertThat(payload, 'session.insufficient_info');

      // Will throw ConnectorError if failed to fetch the provider's config
      return await connectorInstance.getAuthorizationUrl(
        payload,
        async (connectorSession: ConnectorSession) =>
          assignConnectorSessionResult(ctx, provider, connectorSession)
      );
    }

    // TODO: Implement SAML SSO providers logic
    throw new Error('Not implemented');
  } catch (error: unknown) {
    // Catch ConnectorError and re-throw as 500 RequestError
    if (error instanceof ConnectorError) {
      throw new RequestError({ code: `connector.${error.code}`, status: 500 }, error.data);
    }

    throw error;
  }
};

type SsoAuthenticationResult = {
  issuer: string;
  userInfo: SocialUserInfo;
};

export const getSsoAuthentication = async (
  ctx: WithLogContext,
  { provider }: TenantContext,
  connectorData: SupportedSsoConnector,
  data?: unknown
): Promise<SsoAuthenticationResult> => {
  const { createLog } = ctx;
  const { id: connectorId, providerName } = connectorData;

  const log = createLog(`Interaction.SignIn.Identifier.SingleSignOn.Submit`);
  log.append({ connectorId, data });

  try {
    // Will throw ConnectorError if the config is invalid
    const connectorInstance = new ssoConnectorFactories[providerName].constructor(connectorData);

    const issuer = connectorInstance.getIssuer();
    const userInfo = await connectorInstance.getUserInfo(data, async () =>
      getConnectorSessionResult(ctx, provider)
    );

    const result = {
      issuer,
      userInfo,
    };

    log.append({ issuer, userInfo });

    return result;

    // TODO: Implement SAML SSO providers logic
  } catch (error: unknown) {
    // Catch ConnectorError and re-throw as 500 RequestError
    if (error instanceof ConnectorError) {
      throw new RequestError({ code: `connector.${error.code}`, status: 500 }, error.data);
    }

    throw error;
  }
};

export const signInWithSsoAuthentication = async (
  ctx: WithLogContext & WithInteractionHooksContext,
  {
    provider,
    queries: { userSsoIdentities: userSsoIdentitiesQueries, users: usersQueries },
  }: TenantContext,
  {
    connectorData: { id: connectorId, syncProfile },
    userSsoIdentity: { id, userId },
    ssoAuthentication,
  }: {
    connectorData: SupportedSsoConnector;
    userSsoIdentity: UserSsoIdentity;
    ssoAuthentication: SsoAuthenticationResult;
  }
) => {
  const { createLog, assignInteractionHookResult } = ctx;

  const log = createLog(`Interaction.SignIn.Submit`);

  const { userInfo } = ssoAuthentication;

  // Update the user's SSO identity details
  await userSsoIdentitiesQueries.updateById(id, {
    detail: userInfo,
  });

  const { name, avatar } = userInfo;

  // Sync the user name and avatar to the existing user if the connector has syncProfile enabled (sign-in)
  const syncingProfile = syncProfile
    ? {
        ...conditional(name && { name }),
        ...conditional(avatar && { avatar }),
      }
    : undefined;

  // Profile update should not block the sign-in process
  await trySafe(async () =>
    usersQueries.updateUserById(userId, {
      ...syncingProfile,
      lastSignInAt: Date.now(),
    })
  );

  log.append({
    userId,
    interaction: {
      ssoIdentity: {
        connectorId,
        ...ssoAuthentication,
      },
      profile: syncingProfile,
    },
  });

  await assignInteractionResults(ctx, provider, { login: { accountId: userId } });
  assignInteractionHookResult({ userId });
};
