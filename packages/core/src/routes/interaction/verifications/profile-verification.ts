import type { Profile, User } from '@logto/schemas';
import { Event } from '@logto/schemas';
import { argon2Verify } from 'hash-wasm';
import type { Provider } from 'oidc-provider';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  findUserById,
  hasUser,
  hasUserWithEmail,
  hasUserWithPhone,
  hasUserWithIdentity,
} from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

import { registerProfileSafeGuard, forgotPasswordProfileGuard } from '../types/guard.js';
import type {
  InteractionContext,
  Identifier,
  SocialIdentifier,
  IdentifierVerifiedInteractionResult,
  VerifiedInteractionResult,
  VerifiedRegisterInteractionResult,
  RegisterSafeProfile,
  VerifiedSignInInteractionResult,
  VerifiedForgotPasswordInteractionResult,
} from '../types/index.js';
import { isUserPasswordSet } from '../utils/index.js';
import { storeInteractionResult } from '../utils/interaction.js';

const verifyProfileIdentifiers = (
  { email, phone, connectorId }: Profile,
  identifiers: Identifier[] = []
) => {
  if (email) {
    assertThat(
      identifiers.some(
        (identifier) => identifier.key === 'emailVerified' && identifier.value === email
      ),
      new RequestError({
        code: 'session.verification_session_not_found',
        status: 404,
      })
    );
  }

  if (phone) {
    assertThat(
      identifiers.some(
        (identifier) => identifier.key === 'phoneVerified' && identifier.value === phone
      ),
      new RequestError({
        code: 'session.verification_session_not_found',
        status: 404,
      })
    );
  }

  if (connectorId) {
    assertThat(
      identifiers.some(
        (identifier) => identifier.key === 'social' && identifier.connectorId === connectorId
      ),
      new RequestError({
        code: 'session.connector_session_not_found',
        status: 404,
      })
    );
  }
};

const verifyProfileNotRegistered = async (
  { username, email, phone, connectorId }: Profile,
  identifiers: Identifier[] = []
) => {
  if (username) {
    assertThat(
      !(await hasUser(username)),
      new RequestError({
        code: 'user.username_already_in_use',
        status: 422,
      })
    );
  }

  if (email) {
    assertThat(
      !(await hasUserWithEmail(email)),
      new RequestError({
        code: 'user.email_already_in_use',
        status: 422,
      })
    );
  }

  if (phone) {
    assertThat(
      !(await hasUserWithPhone(phone)),
      new RequestError({
        code: 'user.phone_already_in_use',
        status: 422,
      })
    );
  }

  if (connectorId) {
    const {
      metadata: { target },
    } = await getLogtoConnectorById(connectorId);

    const socialIdentifier = identifiers.find(
      (identifier): identifier is SocialIdentifier => identifier.key === 'social'
    );

    // Social identifier session should be verified by verifyProfileIdentifiers
    if (!socialIdentifier) {
      return;
    }

    assertThat(
      !(await hasUserWithIdentity(target, socialIdentifier.userInfo.id)),
      new RequestError({
        code: 'user.identity_already_in_use',
        status: 422,
      })
    );
  }
};

const verifyProfileNotExist = async ({ username, email, phone, password }: Profile, user: User) => {
  if (username) {
    assertThat(
      !user.username,
      new RequestError({
        code: 'user.username_exists_in_profile',
      })
    );
  }

  if (email) {
    assertThat(
      !user.primaryEmail,
      new RequestError({
        code: 'user.email_exists_in_profile',
      })
    );
  }

  if (phone) {
    assertThat(
      !user.primaryPhone,
      new RequestError({
        code: 'user.phone_exists_in_profile',
      })
    );
  }

  if (password) {
    assertThat(
      !isUserPasswordSet(user),
      new RequestError({
        code: 'user.password_exists_in_profile',
      })
    );
  }
};

const isValidRegisterProfile = (profile: Profile): profile is RegisterSafeProfile =>
  registerProfileSafeGuard.safeParse(profile).success;

export default async function verifyProfile(
  ctx: InteractionContext,
  provider: Provider,
  interaction: IdentifierVerifiedInteractionResult
): Promise<VerifiedInteractionResult> {
  const profile = { ...interaction.profile, ...ctx.interactionPayload.profile };

  const { event, identifiers, accountId } = interaction;

  if (event === Event.Register) {
    // Verify the profile includes sufficient identifiers to register a new account
    assertThat(isValidRegisterProfile(profile), new RequestError({ code: 'guard.invalid_input' }));

    verifyProfileIdentifiers(profile, identifiers);
    await verifyProfileNotRegistered(profile, identifiers);

    const interactionWithProfile: VerifiedRegisterInteractionResult = { ...interaction, profile };
    await storeInteractionResult(interactionWithProfile, ctx, provider);

    return interactionWithProfile;
  }

  if (event === Event.SignIn) {
    verifyProfileIdentifiers(profile, identifiers);
    // Find existing account
    const user = await findUserById(accountId);
    await verifyProfileNotExist(profile, user);
    await verifyProfileNotRegistered(profile, identifiers);

    const interactionWithProfile: VerifiedSignInInteractionResult = { ...interaction, profile };
    await storeInteractionResult(interactionWithProfile, ctx, provider);

    return interactionWithProfile;
  }

  // Forgot Password
  const passwordProfileResult = forgotPasswordProfileGuard.safeParse(profile);
  assertThat(
    passwordProfileResult.success,
    new RequestError({ code: 'user.new_password_required_in_profile', status: 422 })
  );

  const passwordProfile = passwordProfileResult.data;

  const { passwordEncrypted: oldPasswordEncrypted } = await findUserById(accountId);

  assertThat(
    !oldPasswordEncrypted ||
      !(await argon2Verify({ password: passwordProfile.password, hash: oldPasswordEncrypted })),
    new RequestError({ code: 'user.same_password', status: 422 })
  );

  const interactionWithProfile: VerifiedForgotPasswordInteractionResult = {
    ...interaction,
    profile: passwordProfile,
  };
  await storeInteractionResult(interactionWithProfile, ctx, provider);

  return interactionWithProfile;
}
