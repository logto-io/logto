import type { User, Profile } from '@logto/schemas';
import { InteractionEvent, UserRole, adminConsoleApplicationId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import { encryptUserPassword } from '#src/libraries/user.js';
import type { LogEntry } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import type { WithInteractionDetailsContext } from '../middleware/koa-interaction-details.js';
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
  // Should pickup the verified social user info result automatically
  const socialIdentifier = identifiers.find((identifier) => identifier.connectorId === connectorId);

  if (!socialIdentifier) {
    return;
  }

  const {
    metadata: { target },
    dbEntry: { syncProfile },
  } = await getLogtoConnectorById(connectorId);

  const { userInfo } = socialIdentifier;
  const { name, avatar, id } = userInfo;

  // Update the user name and avatar if the connector has syncProfile enabled or is new registered user
  const profileUpdate = conditional(
    (syncProfile || !user) && {
      ...conditional(name && { name }),
      ...conditional(avatar && { avatar }),
    }
  );

  return {
    identities: { ...user?.identities, [target]: { userId: id, details: userInfo } },
    ...profileUpdate,
  };
};

const getSyncedSocialUserProfile = async (
  { getLogtoConnectorById }: ConnectorLibrary,
  socialIdentifier: SocialIdentifier
) => {
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
    ...conditional(phone && { primaryPhone: phone }),
    ...conditional(username && { username }),
    ...conditional(email && { primaryEmail: email }),
    ...passwordProfile,
    ...socialProfile,
  };
};

const parseUserProfile = async (
  connectorLibrary: ConnectorLibrary,
  { profile, identifiers }: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult,
  user?: User
) => {
  const { authIdentifiers, profileIdentifiers } = categorizeIdentifiers(identifiers ?? [], profile);

  const newUserProfile =
    profile && (await parseNewUserProfile(connectorLibrary, profile, profileIdentifiers, user));

  // Sync the last social profile
  const socialIdentifier = filterSocialIdentifiers(authIdentifiers).slice(-1)[0];

  const syncedSocialUserProfile =
    socialIdentifier && (await getSyncedSocialUserProfile(connectorLibrary, socialIdentifier));

  return {
    ...syncedSocialUserProfile,
    ...newUserProfile,
    lastSignInAt: Date.now(),
  };
};

export default async function submitInteraction(
  interaction: VerifiedInteractionResult,
  ctx: WithInteractionDetailsContext,
  { provider, libraries, queries }: TenantContext,
  log?: LogEntry
) {
  const { hasActiveUsers, findUserById, updateUserById } = queries.users;

  const {
    users: { generateUserId, insertUser },
    connectors,
  } = libraries;
  const { event, profile } = interaction;

  if (event === InteractionEvent.Register) {
    const id = await generateUserId();
    const upsertProfile = await parseUserProfile(connectors, interaction);

    const { client_id } = ctx.interactionDetails.params;

    const createAdminUser =
      String(client_id) === adminConsoleApplicationId && !(await hasActiveUsers());
    const roleNames = createAdminUser ? [UserRole.Admin] : undefined;

    await insertUser({
      id,
      ...conditional(roleNames && { roleNames }),
      ...upsertProfile,
    });

    await assignInteractionResults(ctx, provider, { login: { accountId: id } });

    log?.append({ userId: id });

    return;
  }

  const { accountId } = interaction;
  log?.append({ userId: accountId });

  if (event === InteractionEvent.SignIn) {
    const user = await findUserById(accountId);
    const upsertProfile = await parseUserProfile(connectors, interaction, user);

    await updateUserById(accountId, upsertProfile);

    await assignInteractionResults(ctx, provider, { login: { accountId } });

    return;
  }

  // Forgot Password
  const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(
    profile.password
  );

  await updateUserById(accountId, { passwordEncrypted, passwordEncryptionMethod });
  await clearInteractionStorage(ctx, provider);
  ctx.status = 204;
}
