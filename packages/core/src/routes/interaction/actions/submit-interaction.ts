import type { User } from '@logto/schemas';
import { InteractionEvent, UserRole, adminConsoleApplicationId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { Provider } from 'oidc-provider';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import { encryptUserPassword, generateUserId, insertUser } from '#src/libraries/user.js';
import { hasActiveUsers, findUserById, updateUserById } from '#src/queries/user.js';

import type { WithInteractionDetailsContext } from '../middleware/koa-interaction-details.js';
import type {
  Identifier,
  VerifiedInteractionResult,
  SocialIdentifier,
  VerifiedSignInInteractionResult,
  VerifiedRegisterInteractionResult,
} from '../types/index.js';
import { clearInteractionStorage } from '../utils/interaction.js';

const getSocialUpdateProfile = async ({
  user,
  connectorId,
  identifiers,
}: {
  user?: User;
  connectorId: string;
  identifiers?: Identifier[];
}) => {
  // TODO: @simeng refactor me. This step should be verified by the previous profile verification cycle Already.
  // Should pickup the verified social user info result automatically
  const socialIdentifier = identifiers?.find(
    (identifier): identifier is SocialIdentifier =>
      identifier.key === 'social' && identifier.connectorId === connectorId
  );

  if (!socialIdentifier) {
    return;
  }

  const {
    metadata: { target },
    dbEntry: { syncProfile },
  } = await getLogtoConnectorById(connectorId);

  const { userInfo } = socialIdentifier;
  const { name, avatar, id } = userInfo;

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

const parseUserProfile = async (
  { profile, identifiers }: VerifiedSignInInteractionResult | VerifiedRegisterInteractionResult,
  user?: User
) => {
  if (!profile) {
    return;
  }

  const { phone, username, email, connectorId, password } = profile;

  const [passwordProfile, socialProfile] = await Promise.all([
    conditional(password && (await encryptUserPassword(password))),
    conditional(connectorId && (await getSocialUpdateProfile({ connectorId, identifiers, user }))),
  ]);

  return {
    ...conditional(phone && { primaryPhone: phone }),
    ...conditional(username && { username }),
    ...conditional(email && { primaryEmail: email }),
    ...passwordProfile,
    ...socialProfile,
    lastSignInAt: Date.now(),
  };
};

export default async function submitInteraction(
  interaction: VerifiedInteractionResult,
  ctx: WithInteractionDetailsContext,
  provider: Provider
) {
  const { event, profile } = interaction;

  if (event === InteractionEvent.Register) {
    const id = await generateUserId();
    const upsertProfile = await parseUserProfile(interaction);

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

    return;
  }

  const { accountId } = interaction;

  if (event === InteractionEvent.SignIn) {
    const user = await findUserById(accountId);
    const upsertProfile = await parseUserProfile(interaction, user);

    if (upsertProfile) {
      await updateUserById(accountId, upsertProfile);
    }

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
