/* eslint-disable max-lines -- will migrate this file to the latest experience APIs */
import { appInsights } from '@logto/app-insights/node';
import { ConnectorError } from '@logto/connector-kit';
import { validateRedirectUrl } from '@logto/core-kit';
import {
  type EncryptedTokenSet,
  InteractionEvent,
  type SupportedSsoConnector,
  type User,
  type UserSsoIdentity,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import { idpInitiatedSamlSsoSessionCookieName } from '#src/constants/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import OidcConnector from '#src/sso/OidcConnector/index.js';
import SamlConnector from '#src/sso/SamlConnector/index.js';
import { ssoConnectorFactories, type SingleSignOnConnectorSession } from '#src/sso/index.js';
import { type ExtendedSocialUserInfo } from '#src/sso/types/saml.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { safeParseUnknownJson } from '#src/utils/json.js';
import { encryptAndSerializeTokenResponse } from '#src/utils/secret-encryption.js';

import { type WithInteractionHooksContext } from '../middleware/koa-interaction-hooks.js';

import {
  assignSingleSignOnAuthenticationResult,
  assignSingleSignOnSessionResult,
  getSingleSignOnSessionResult,
} from './single-sign-on-session.js';

export const authorizationUrlPayloadGuard = z.object({
  state: z.string().min(1),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
});
type AuthorizationUrlPayload = z.infer<typeof authorizationUrlPayloadGuard>;

export const getSsoAuthorizationUrl = async (
  ctx: WithLogContext,
  { provider, queries, envSet }: TenantContext,
  connectorData: SupportedSsoConnector,
  payload: AuthorizationUrlPayload
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
    const connectorInstance = new ssoConnectorFactories[providerName].constructor(
      connectorData,
      envSet.endpoint
    );

    assertThat(payload, 'session.insufficient_info');

    const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

    if (
      // TODO: Remove this check when IdP-initiated SSO is fully supported
      EnvSet.values.isDevFeaturesEnabled &&
      connectorInstance instanceof SamlConnector
    ) {
      // Check if a IdP-initiated SSO session exists
      const sessionId = ctx.cookies.get(idpInitiatedSamlSsoSessionCookieName);

      const idpInitiatedSamlSsoSession =
        sessionId && (await queries.ssoConnectors.findIdpInitiatedSamlSsoSessionById(sessionId));

      // Consume the session if it exists and the connector matches
      if (idpInitiatedSamlSsoSession && idpInitiatedSamlSsoSession.connectorId === connectorId) {
        log.append({ idpInitiatedSamlSsoSession });

        // Clear the session cookie
        ctx.cookies.set(idpInitiatedSamlSsoSessionCookieName, '', {
          httpOnly: true,
          expires: new Date(0),
        });

        // Safely clear the session record
        void trySafe(async () => {
          await queries.ssoConnectors.deleteIdpInitiatedSamlSsoSessionById(sessionId);
        });

        const { expiresAt, assertionContent } = idpInitiatedSamlSsoSession;

        // Validate the session expiry
        // Directly assign the SAML assertion result to the interaction and redirect to the SSO callback URL
        if (expiresAt > Date.now()) {
          const userInfo = connectorInstance.getUserInfoFromSamlAssertion(assertionContent);
          const { redirectUri, state } = payload;
          await assignSingleSignOnSessionResult(ctx, provider, {
            redirectUri,
            state,
            userInfo,
            connectorId,
          });
          // Redirect to the callback URL directly if the session is valid
          const url = new URL(redirectUri);
          url.searchParams.append('state', state);
          return url.toString();
        }
      }
    }

    return await connectorInstance.getAuthorizationUrl(
      { jti, ...payload, connectorId },
      async (connectorSession: SingleSignOnConnectorSession) =>
        assignSingleSignOnSessionResult(ctx, provider, connectorSession)
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
  /** The issuer of the SSO provider, we need to store this in the user SSO identity to identify the provider. */
  issuer: string;
  userInfo: ExtendedSocialUserInfo;
  /**
   * Only applied to the OIDC connectors.
   * If the SSO connector has token storage enabled,
   * this will contain the encrypted token set from the OIDC provider.
   */
  encryptedTokenSet?: EncryptedTokenSet;
};

/**
 * Verify the SSO identity from the SSO provider
 *
 * - Load the SSO session from the OIDC provider interaction details
 * - Verify the SSO identity from the SSO provider
 *
 * @returns The SSO authentication result
 */
export const verifySsoIdentity = async (
  ctx: WithLogContext,
  { provider, envSet }: TenantContext,
  connectorData: SupportedSsoConnector,
  data: Record<string, unknown>
): Promise<SsoAuthenticationResult> => {
  const { id: connectorId, providerName } = connectorData;

  const { createLog } = ctx;

  const log = createLog(`Interaction.SignIn.Identifier.SingleSignOn.Submit`);
  log.append({ connectorId, data });
  const singleSignOnSession = await getSingleSignOnSessionResult(ctx, provider);

  try {
    // Will throw ConnectorError if the config is invalid
    const connectorInstance = new ssoConnectorFactories[providerName].constructor(
      connectorData,
      envSet.endpoint
    );

    const { enableTokenStorage } = connectorData;

    const issuer = await connectorInstance.getIssuer();

    if (connectorInstance instanceof OidcConnector) {
      const { userInfo, tokenResponse } = await connectorInstance.getUserInfo(
        singleSignOnSession,
        data
      );

      log.append({ issuer, userInfo });

      return {
        issuer,
        userInfo,
        encryptedTokenSet: conditional(
          enableTokenStorage &&
            // Only store the token response if it contains an access token.
            tokenResponse?.access_token &&
            trySafe(
              () => encryptAndSerializeTokenResponse(tokenResponse),
              (error) => {
                // If the token response cannot be encrypted, we log the error but continue to return user info.
                void appInsights.trackException(error);
              }
            )
        ),
      };
    }

    const { userInfo } = await connectorInstance.getUserInfo(singleSignOnSession);

    return {
      issuer,
      userInfo,
    };
  } catch (error: unknown) {
    // Catch ConnectorError and re-throw as 500 RequestError
    if (error instanceof ConnectorError) {
      throw new RequestError({ code: `connector.${error.code}`, status: 500 }, error.data);
    }
    throw error;
  }
};

// Remark:
// The following functions are used in the legacy interaction single sign on routes only.
// The SSO interaction flow will be handled in the latest experience APIs using the SSO verification record.

/** Verify the SSO identity and assign the authentication result to the interaction result */
export const getSsoAuthentication = async (
  ctx: WithInteractionHooksContext<WithLogContext>,
  tenantContext: TenantContext,
  connectorData: SupportedSsoConnector,
  data: Record<string, unknown>
): Promise<SsoAuthenticationResult> => {
  const { provider } = tenantContext;
  const { id: connectorId } = connectorData;

  const ssoAuthentication = await verifySsoIdentity(ctx, tenantContext, connectorData, data);

  // Assign the single sign on authentication to the interaction result
  await assignSingleSignOnAuthenticationResult(ctx, provider, {
    connectorId,
    ...ssoAuthentication,
  });

  return ssoAuthentication;
};

// Handle the SSO authentication result and return the user id
export const handleSsoAuthentication = async (
  ctx: WithInteractionHooksContext<WithLogContext>,
  tenant: TenantContext,
  connectorData: SupportedSsoConnector,
  ssoAuthentication: SsoAuthenticationResult
): Promise<string> => {
  const { queries } = tenant;
  const { userSsoIdentities: userSsoIdentitiesQueries, users: usersQueries } = queries;
  const { issuer, userInfo } = ssoAuthentication;

  // Get logto user info
  const userSsoIdentity = await userSsoIdentitiesQueries.findUserSsoIdentityBySsoIdentityId(
    issuer,
    userInfo.id
  );

  // SignIn
  if (userSsoIdentity) {
    return signInWithSsoAuthentication(ctx, tenant, {
      connectorData,
      userSsoIdentity,
      ssoAuthentication,
    });
  }

  const user = userInfo.email && (await usersQueries.findUserByEmail(userInfo.email));

  // SignIn and link with existing user account with a same email
  if (user) {
    return signInAndLinkWithSsoAuthentication(ctx, tenant, {
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
  ctx: WithInteractionHooksContext<WithLogContext>,
  { queries: { userSsoIdentities: userSsoIdentitiesQueries, users: usersQueries } }: TenantContext,
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
    detail: safeParseUnknownJson(userInfo),
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
  ctx: WithInteractionHooksContext<WithLogContext>,
  {
    queries: { userSsoIdentities: userSsoIdentitiesQueries, users: usersQueries },
    libraries: { users: usersLibrary },
  }: TenantContext,
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
    detail: safeParseUnknownJson(userInfo),
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

  // JIT provision for existing users signing in with SSO for the first time
  const provisionedOrganizations = await usersLibrary.provisionOrganizations({
    userId,
    ssoConnectorId: connectorId,
  });

  for (const { organizationId } of provisionedOrganizations) {
    ctx.appendDataHookContext('Organization.Membership.Updated', {
      organizationId,
    });
  }

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
  ctx: WithInteractionHooksContext<WithLogContext>,
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
  const [user] = await usersLibrary.insertUser(
    {
      id: await usersLibrary.generateUserId(),
      ...syncingProfile,
      lastSignInAt: Date.now(),
    },
    { isInteractive: true }
  );

  const { id: userId } = user;

  // Insert new user SSO identity
  await userSsoIdentitiesQueries.insert({
    id: generateStandardId(),
    userId,
    ssoConnectorId: connectorId,
    identityId: userInfo.id,
    issuer,
    detail: safeParseUnknownJson(userInfo),
  });

  // JIT provision for new users signing up with SSO
  const provisionedOrganizations = await usersLibrary.provisionOrganizations({
    userId: user.id,
    ssoConnectorId: connectorId,
  });

  for (const { organizationId } of provisionedOrganizations) {
    ctx.appendDataHookContext('Organization.Membership.Updated', {
      organizationId,
    });
  }

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

  return user;
};
/* eslint-enable max-lines */
