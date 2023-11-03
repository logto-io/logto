import { type ConnectorSession, ConnectorError, type SocialUserInfo } from '@logto/connector-kit';
import { validateRedirectUrl } from '@logto/core-kit';
import { InteractionEvent, type User, type UserSsoIdentity } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import OidcConnector from '#src/sso/OidcConnector/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { type SupportedSsoConnector } from '#src/sso/types/index.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { type WithInteractionHooksContext } from '../middleware/koa-interaction-hooks.js';

import { storeInteractionResult } from './interaction.js';
import { assignConnectorSessionResult, getConnectorSessionResult } from './social-verification.js';

export const oidcAuthorizationUrlPayloadGuard = z.object({
  state: z.string().min(1),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
});

type OidcAuthorizationUrlPayload = z.infer<typeof oidcAuthorizationUrlPayloadGuard>;

// Get the authorization url for the SSO provider
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

// Get the user authentication result from the SSO provider
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

// Handle the SSO authentication result and return the user id
export const handleSsoAuthentication = async (
  ctx: WithLogContext & WithInteractionHooksContext,
  tenant: TenantContext,
  connectorData: SupportedSsoConnector,
  ssoAuthentication: SsoAuthenticationResult
): Promise<string> => {
  const { createLog } = ctx;
  const { provider, queries } = tenant;
  const { userSsoIdentities: userSsoIdentitiesQueries, users: usersQueries } = queries;
  const { issuer, userInfo } = ssoAuthentication;

  // Get logto user info
  const userSsoIdentity = await userSsoIdentitiesQueries.findUserSsoIdentityBySsoIdentityId(
    issuer,
    userInfo.id
  );

  // SignIn
  if (userSsoIdentity) {
    return signInWithSsoAuthentication(ctx, queries, {
      connectorData,
      userSsoIdentity,
      ssoAuthentication,
    });
  }

  const user = userInfo.email && (await usersQueries.findUserByEmail(userInfo.email));

  // SignIn and link with existing user account with a same email
  if (user) {
    return signInAndLinkWithSsoAuthentication(ctx, queries, {
      connectorData,
      user,
      ssoAuthentication,
    });
  }

  // Update the interaction session event to register if no related user account found
  const registerEventUpdateLog = createLog(`Interaction.Register.Update`);
  registerEventUpdateLog.append({ event: 'register' });
  await storeInteractionResult({ event: InteractionEvent.Register }, ctx, provider);

  // Register
  return registerWithSsoAuthentication(ctx, tenant, connectorData, ssoAuthentication);
};

const signInWithSsoAuthentication = async (
  ctx: WithLogContext & WithInteractionHooksContext,
  { userSsoIdentities: userSsoIdentitiesQueries, users: usersQueries }: Queries,
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
  const { createLog } = ctx;
  const log = createLog(`Interaction.SignIn.Submit`);

  const { userInfo, issuer } = ssoAuthentication;

  // Update the user's SSO identity details
  await userSsoIdentitiesQueries.updateById(id, {
    detail: userInfo,
  });

  const { name, avatar, id: identityId } = userInfo;

  // Sync the user name and avatar to the existing user if the connector has syncProfile enabled (sign-in)
  const syncingProfile = syncProfile
    ? {
        ...conditional(name && { name }),
        ...conditional(avatar && { avatar }),
      }
    : undefined;

  await usersQueries.updateUserById(userId, {
    ...syncingProfile,
    lastSignInAt: Date.now(),
  });

  log.append({
    userId,
    interaction: {
      event: InteractionEvent.SignIn,
      ssoIdentity: {
        connectorId,
        issuer,
        identityId,
      },
      profile: syncingProfile,
    },
  });

  return userId;
};

const signInAndLinkWithSsoAuthentication = async (
  ctx: WithLogContext & WithInteractionHooksContext,
  { userSsoIdentities: userSsoIdentitiesQueries, users: usersQueries }: Queries,
  {
    connectorData: { id: connectorId, syncProfile },
    user: { id: userId },
    ssoAuthentication,
  }: {
    connectorData: SupportedSsoConnector;
    user: User;
    ssoAuthentication: SsoAuthenticationResult;
  }
) => {
  const { createLog } = ctx;
  const log = createLog(`Interaction.SignIn.Submit`);

  const { issuer, userInfo } = ssoAuthentication;
  const { name, avatar, id: identityId } = userInfo;

  // Insert new user SSO identity
  await userSsoIdentitiesQueries.insert({
    id: generateStandardId(),
    userId,
    identityId,
    issuer,
    detail: userInfo,
  });

  // Sync the user name and avatar to the existing user if the connector has syncProfile enabled (sign-in)
  const syncingProfile = syncProfile
    ? {
        ...conditional(name && { name }),
        ...conditional(avatar && { avatar }),
      }
    : undefined;

  await usersQueries.updateUserById(userId, {
    ...syncingProfile,
    lastSignInAt: Date.now(),
  });

  log.append({
    userId,
    interaction: {
      event: InteractionEvent.SignIn,
      ssoIdentity: {
        connectorId,
        issuer,
        identityId,
      },
      profile: syncingProfile,
    },
  });

  return userId;
};

const registerWithSsoAuthentication = async (
  ctx: WithLogContext & WithInteractionHooksContext,
  {
    queries: { userSsoIdentities: userSsoIdentitiesQueries },
    libraries: { users: usersLibrary },
  }: TenantContext,
  connectorData: SupportedSsoConnector,
  ssoAuthentication: SsoAuthenticationResult
) => {
  const { createLog } = ctx;
  const log = createLog(`Interaction.Register.Submit`);
  const { issuer, userInfo } = ssoAuthentication;

  // Only sync the name, avatar and email (conflict email account will be guarded ahead)
  const syncingProfile = {
    ...conditional(userInfo.name && { name: userInfo.name }),
    ...conditional(userInfo.avatar && { avatar: userInfo.avatar }),
    ...conditional(userInfo.email && { primaryEmail: userInfo.email }),
  };

  // Insert new user
  const { id: userId } = await usersLibrary.insertUser(
    {
      id: generateStandardId(),
      ...syncingProfile,
      lastSignInAt: Date.now(),
    },
    []
  );

  // Insert new user SSO identity
  await userSsoIdentitiesQueries.insert({
    id: generateStandardId(),
    userId,
    identityId: userInfo.id,
    issuer,
    detail: userInfo,
  });

  log.append({
    userId,
    interaction: {
      event: InteractionEvent.Register,
      ssoIdentity: {
        connectorId: connectorData.id,
        issuer,
        identityId: userInfo.id,
      },
      profile: syncingProfile,
    },
  });

  return userId;
};
