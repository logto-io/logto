import { ConnectorError, type SocialUserInfo } from '@logto/connector-kit';
import { validateRedirectUrl } from '@logto/core-kit';
import {
  InteractionEvent,
  type User,
  type UserSsoIdentity,
  type SupportedSsoConnector,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import { type WithInteractionDetailsContext } from '#src/routes/interaction/middleware/koa-interaction-details.js';
import { ssoConnectorFactories, type SingleSignOnConnectorSession } from '#src/sso/index.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import {
  getSingleSignOnSessionResult,
  assignSingleSignOnAuthenticationResult,
} from './single-sign-on-session.js';
import { assignConnectorSessionResult } from './social-verification.js';

export const authorizationUrlPayloadGuard = z.object({
  state: z.string().min(1),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
});

type AuthorizationUrlPayload = z.infer<typeof authorizationUrlPayloadGuard>;

// Get the authorization url for the SSO provider
export const getSsoAuthorizationUrl = async (
  ctx: WithLogContext & WithInteractionDetailsContext,
  { provider, id: tenantId }: TenantContext,
  connectorData: SupportedSsoConnector,
  payload: AuthorizationUrlPayload
): Promise<string> => {
  const { id: connectorId, providerName } = connectorData;

  const {
    createLog,
    interactionDetails: { jti },
  } = ctx;

  const log = createLog(`Interaction.SignIn.Identifier.SingleSignOn.Create`);
  log.append({
    connectorId,
    payload,
  });

  try {
    // Will throw ConnectorError if the config is invalid
    const connectorInstance = new ssoConnectorFactories[providerName].constructor(
      connectorData,
      tenantId
    );

    assertThat(payload, 'session.insufficient_info');

    return await connectorInstance.getAuthorizationUrl(
      { jti, ...payload, connectorId },
      async (connectorSession: SingleSignOnConnectorSession) =>
        assignConnectorSessionResult(ctx, provider, connectorSession)
    );
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
  { provider, id: tenantId }: TenantContext,
  connectorData: SupportedSsoConnector,
  data: Record<string, unknown>
): Promise<SsoAuthenticationResult> => {
  const { createLog } = ctx;
  const { id: connectorId, providerName } = connectorData;

  const log = createLog(`Interaction.SignIn.Identifier.SingleSignOn.Submit`);
  log.append({ connectorId, data });

  const singleSignOnSession = await getSingleSignOnSessionResult(ctx, provider);

  try {
    // Will throw ConnectorError if the config is invalid
    const connectorInstance = new ssoConnectorFactories[providerName].constructor(
      connectorData,
      tenantId
    );

    const issuer = await connectorInstance.getIssuer();
    const userInfo = await connectorInstance.getUserInfo(singleSignOnSession, data);

    const result = {
      issuer,
      userInfo,
    };

    // Assign the single sign on authentication to the interaction result
    await assignSingleSignOnAuthenticationResult(ctx, provider, {
      connectorId,
      ...result,
    });

    log.append({ issuer, userInfo });

    return result;
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
  ctx: WithLogContext,
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

  throw new RequestError(
    {
      code: 'user.identity_not_exist',
      status: 422,
    },
    {}
  );
};

const signInWithSsoAuthentication = async (
  ctx: WithLogContext,
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
  ctx: WithLogContext,
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
    ssoConnectorId: connectorId,
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

export const registerWithSsoAuthentication = async (
  ctx: WithLogContext,
  {
    queries: { userSsoIdentities: userSsoIdentitiesQueries },
    libraries: { users: usersLibrary },
  }: TenantContext,
  ssoAuthentication: SsoAuthenticationResult & { connectorId: string }
) => {
  const { createLog } = ctx;
  const log = createLog(`Interaction.Register.Submit`);
  const { issuer, userInfo, connectorId } = ssoAuthentication;

  // Only sync the name, avatar and email (conflict email account will be guarded ahead)
  const syncingProfile = {
    ...conditional(userInfo.name && { name: userInfo.name }),
    ...conditional(userInfo.avatar && { avatar: userInfo.avatar }),
    ...conditional(userInfo.email && { primaryEmail: userInfo.email }),
  };

  // Insert new user
  const { id: userId } = await usersLibrary.insertUser(
    {
      id: await usersLibrary.generateUserId(),
      ...syncingProfile,
      lastSignInAt: Date.now(),
    },
    []
  );

  // Insert new user SSO identity
  await userSsoIdentitiesQueries.insert({
    id: generateStandardId(),
    userId,
    ssoConnectorId: connectorId,
    identityId: userInfo.id,
    issuer,
    detail: userInfo,
  });

  log.append({
    userId,
    interaction: {
      event: InteractionEvent.Register,
      ssoIdentity: {
        connectorId,
        issuer,
        userInfo,
      },
      profile: syncingProfile,
    },
  });

  return userId;
};
