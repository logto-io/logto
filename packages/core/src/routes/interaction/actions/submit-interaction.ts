import { defaults, parseAffiliateData } from '@logto/affiliate';
import { Component, CoreEvent, getEventName } from '@logto/app-insights/custom-event';
import { appInsights } from '@logto/app-insights/node';
import type { User, Profile, CreateUser } from '@logto/schemas';
import {
  AdminTenantRole,
  SignInMode,
  getManagementApiAdminName,
  defaultTenantId,
  adminTenantId,
  InteractionEvent,
  adminConsoleApplicationId,
} from '@logto/schemas';
import { generateStandardId, type OmitAutoSetFields } from '@logto/shared';
import { conditional, conditionalArray, trySafe } from '@silverhand/essentials';
import { type IRouterContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import { encryptUserPassword } from '#src/libraries/user.js';
import type { LogEntry, WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import { consoleLog } from '#src/utils/console.js';
import { getTenantId } from '#src/utils/tenant.js';

import type { WithInteractionDetailsContext } from '../middleware/koa-interaction-details.js';
import { type WithInteractionHooksContext } from '../middleware/koa-interaction-hooks.js';
import type {
  Identifier,
  VerifiedInteractionResult,
  SocialIdentifier,
  VerifiedSignInInteractionResult,
  VerifiedRegisterInteractionResult,
} from '../types/index.js';
import { clearInteractionStorage, categorizeIdentifiers } from '../utils/interaction.js';

const filterSocialIdentifiers = (identifiers: Identifier[]): SocialIdentifier[] =>
  identifiers.filter((identifier): identifier is SocialIdentifier => identifier.key === 'social');

const getNewSocialProfile = async (
  { getLogtoConnectorById }: ConnectorLibrary,
  {
    user,
    connectorId,
    identifiers,
  }: {
    user?: User;
    connectorId: string;
    identifiers: SocialIdentifier[];
  }
) => {
  // TODO: @simeng refactor me. This step should be verified by the previous profile verification cycle Already.
  const socialIdentifier = identifiers.find((identifier) => identifier.connectorId === connectorId);

  if (!socialIdentifier) {
    return;
  }

  const {
    metadata: { target },
    dbEntry: { syncProfile },
  } = await getLogtoConnectorById(connectorId);

  const { userInfo } = socialIdentifier;
  const { name, avatar, id, email, phone } = userInfo;

  const identities = { ...user?.identities, [target]: { userId: id, details: userInfo } };

  // Sync the name, avatar, email and phone for new user
  if (!user) {
    return {
      identities,
      ...conditional(name && { name }),
      ...conditional(avatar && { avatar }),
      ...conditional(email && { primaryEmail: email }),
      ...conditional(phone && { primaryPhone: phone }),
    };
  }

  // Sync the user name and avatar if the connector has syncProfile enabled
  return {
    identities,
    ...conditional(
      syncProfile && {
        ...conditional(name && { name }),
        ...conditional(avatar && { avatar }),
      }
    ),
  };
};

const getLatestUserProfileFromSocial = async (
  { getLogtoConnectorById }: ConnectorLibrary,
  authIdentifiers: Identifier[]
) => {
  const socialIdentifier = filterSocialIdentifiers(authIdentifiers).at(-1);

  if (!socialIdentifier) {
    return;
  }

  const {
    userInfo: { name, avatar },
    connectorId,
  } = socialIdentifier;

  const {
    dbEntry: { syncProfile },
  } = await getLogtoConnectorById(connectorId);

  return conditional(
    syncProfile && {
      ...conditional(name && { name }),
      ...conditional(avatar && { avatar }),
    }
  );
};

const parseNewUserProfile = async (
  connectorLibrary: ConnectorLibrary,
  profile: Profile,
  profileIdentifiers: Identifier[],
  user?: User
) => {
  const { phone, username, email, connectorId, password } = profile;

  const [passwordProfile, socialProfile] = await Promise.all([
    conditional(password && (await encryptUserPassword(password))),
    conditional(
      connectorId &&
        (await getNewSocialProfile(connectorLibrary, {
          connectorId,
          identifiers: filterSocialIdentifiers(profileIdentifiers),
          user,
        }))
    ),
  ]);

  return {
    ...socialProfile, // SocialProfile should be applied first
    ...passwordProfile,
    ...conditional(phone && { primaryPhone: phone }),
    ...conditional(username && { username }),
    ...conditional(email && { primaryEmail: email }),
  };
};

const parseUserProfile = async (
  connectorLibrary: ConnectorLibrary,
  { profile, identifiers }: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult,
  user?: User
): Promise<Omit<OmitAutoSetFields<CreateUser>, 'id'>> => {
  const { authIdentifiers, profileIdentifiers } = categorizeIdentifiers(identifiers ?? [], profile);

  const newUserProfile =
    profile && (await parseNewUserProfile(connectorLibrary, profile, profileIdentifiers, user));

  // Sync from the latest social identity profile for existing users
  const syncedSocialUserProfile =
    user && (await getLatestUserProfileFromSocial(connectorLibrary, authIdentifiers));

  return {
    ...syncedSocialUserProfile,
    ...newUserProfile,
    lastSignInAt: Date.now(),
  };
};

const parseBindMfa = ({
  bindMfa,
}: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult):
  | User['mfaVerifications'][number]
  | undefined => {
  if (!bindMfa) {
    return;
  }

  return {
    type: bindMfa.type,
    key: bindMfa.secret,
    id: generateStandardId(),
    createdAt: new Date().toISOString(),
  };
};

const getInitialUserRoles = (
  isInAdminTenant: boolean,
  isCreatingFirstAdminUser: boolean,
  isCloud: boolean
) =>
  conditionalArray<string>(
    isInAdminTenant && AdminTenantRole.User,
    isCreatingFirstAdminUser && getManagementApiAdminName(defaultTenantId),
    isCreatingFirstAdminUser && isCloud && getManagementApiAdminName(adminTenantId)
  );

/** Post affiliate data to the cloud service. */
const postAffiliateLogs = async (
  ctx: IRouterContext,
  cloudConnection: CloudConnectionLibrary,
  userId: string,
  tenantId: string
) => {
  if (!EnvSet.values.isCloud || tenantId !== adminTenantId) {
    return;
  }

  const affiliateData = trySafe(() =>
    parseAffiliateData(JSON.parse(decodeURIComponent(ctx.cookies.get(defaults.cookieName) ?? '')))
  );

  if (affiliateData) {
    const client = await cloudConnection.getClient();
    await client.post('/api/affiliate-logs', {
      body: { userId, ...affiliateData },
    });
    consoleLog.info('Affiliate logs posted', userId);
  }
};

export default async function submitInteraction(
  interaction: VerifiedInteractionResult,
  ctx: WithLogContext & WithInteractionDetailsContext & WithInteractionHooksContext,
  { provider, libraries, connectors, queries, cloudConnection, id: tenantId }: TenantContext,
  log?: LogEntry
) {
  const { hasActiveUsers, findUserById, updateUserById } = queries.users;
  const { updateDefaultSignInExperience } = queries.signInExperiences;

  const {
    users: { generateUserId, insertUser },
  } = libraries;
  const { event, profile } = interaction;

  if (event === InteractionEvent.Register) {
    const id = await generateUserId();
    const userProfile = await parseUserProfile(connectors, interaction);
    const mfaVerification = parseBindMfa(interaction);

    const { client_id } = ctx.interactionDetails.params;

    const { isCloud } = EnvSet.values;
    const isInAdminTenant = (await getTenantId(ctx.URL)) === adminTenantId;
    const isCreatingFirstAdminUser =
      isInAdminTenant &&
      String(client_id) === adminConsoleApplicationId &&
      !(await hasActiveUsers());

    await insertUser(
      {
        id,
        ...userProfile,
        ...conditional(mfaVerification && { mfaVerifications: [mfaVerification] }),
      },
      getInitialUserRoles(isInAdminTenant, isCreatingFirstAdminUser, isCloud)
    );

    // In OSS, we need to limit sign-in experience to "sign-in only" once
    // the first admin has been create since we don't want other unexpected registrations
    if (isCreatingFirstAdminUser) {
      await updateDefaultSignInExperience({
        signInMode: isCloud ? SignInMode.SignInAndRegister : SignInMode.SignIn,
      });
    }

    await assignInteractionResults(ctx, provider, { login: { accountId: id } });
    ctx.assignInteractionHookResult({ userId: id });

    log?.append({ userId: id });
    appInsights.client?.trackEvent({ name: getEventName(Component.Core, CoreEvent.Register) });
    void trySafe(postAffiliateLogs(ctx, cloudConnection, id, tenantId), (error) => {
      consoleLog.warn('Failed to post affiliate logs', error);
      void appInsights.trackException(error);
    });

    return;
  }

  const { accountId } = interaction;
  log?.append({ userId: accountId });

  if (event === InteractionEvent.SignIn) {
    const user = await findUserById(accountId);
    const updateUserProfile = await parseUserProfile(connectors, interaction, user);
    const mfaVerification = parseBindMfa(interaction);

    await updateUserById(accountId, {
      ...updateUserProfile,
      ...conditional(
        mfaVerification && { mfaVerifications: [...user.mfaVerifications, mfaVerification] }
      ),
    });
    await assignInteractionResults(ctx, provider, { login: { accountId } });
    ctx.assignInteractionHookResult({ userId: accountId });

    appInsights.client?.trackEvent({ name: getEventName(Component.Core, CoreEvent.SignIn) });

    return;
  }

  // Forgot Password
  const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(
    profile.password
  );

  await updateUserById(accountId, { passwordEncrypted, passwordEncryptionMethod });
  ctx.assignInteractionHookResult({ userId: accountId });
  await clearInteractionStorage(ctx, provider);
  ctx.status = 204;
}
