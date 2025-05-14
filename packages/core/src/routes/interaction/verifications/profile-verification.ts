import type { Profile, User } from '@logto/schemas';
import { InteractionEvent, UsersPasswordEncryptionMethod } from '@logto/schemas';
import { argon2Verify } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { forgotPasswordProfileGuard } from '../types/guard.js';
import type {
  Identifier,
  SocialIdentifier,
  IdentifierVerifiedInteractionResult,
  VerifiedInteractionResult,
  VerifiedForgotPasswordInteractionResult,
} from '../types/index.js';
import { isUserPasswordSet } from '../utils/index.js';

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

const verifyProfileNotRegisteredByOtherUserAccount = async (
  { queries, connectors }: TenantContext,
  { username, email, phone, connectorId }: Profile,
  identifiers: Identifier[] = []
) => {
  const { hasUser, hasUserWithEmail, hasUserWithNormalizedPhone, hasUserWithIdentity } =
    queries.users;

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
      !(await hasUserWithNormalizedPhone(phone)),
      new RequestError({
        code: 'user.phone_already_in_use',
        status: 422,
      })
    );
  }

  if (connectorId) {
    const {
      metadata: { target },
    } = await connectors.getLogtoConnectorById(connectorId);

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

const verifyProfileNotExistInCurrentUserAccount = async (
  { username, email, phone, password }: Profile,
  user: User
) => {
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

export default async function verifyProfile(
  tenant: TenantContext,
  interaction: IdentifierVerifiedInteractionResult
): Promise<VerifiedInteractionResult> {
  const { findUserById } = tenant.queries.users;
  const { event, identifiers, accountId, profile = {} } = interaction;

  if (event === InteractionEvent.Register) {
    verifyProfileIdentifiers(profile, identifiers);
    await verifyProfileNotRegisteredByOtherUserAccount(tenant, profile, identifiers);

    return interaction;
  }

  if (event === InteractionEvent.SignIn) {
    verifyProfileIdentifiers(profile, identifiers);
    // Find existing account
    const user = await findUserById(accountId);
    await verifyProfileNotExistInCurrentUserAccount(profile, user);
    await verifyProfileNotRegisteredByOtherUserAccount(tenant, profile, identifiers);

    return interaction;
  }

  // Forgot Password
  const passwordProfileResult = forgotPasswordProfileGuard.safeParse(profile);
  assertThat(
    passwordProfileResult.success,
    new RequestError({ code: 'user.new_password_required_in_profile', status: 422 })
  );

  const passwordProfile = passwordProfileResult.data;

  const { passwordEncrypted: oldPasswordEncrypted, passwordEncryptionMethod } =
    await findUserById(accountId);

  // Only compare password if the encryption method (algorithm) is Argon2i
  // if the user is migrated, this check will be skipped
  assertThat(
    !oldPasswordEncrypted ||
      passwordEncryptionMethod !== UsersPasswordEncryptionMethod.Argon2i ||
      !(await argon2Verify({ password: passwordProfile.password, hash: oldPasswordEncrypted })),
    new RequestError({ code: 'user.same_password', status: 422 })
  );

  const interactionWithProfile: VerifiedForgotPasswordInteractionResult = {
    ...interaction,
    profile: passwordProfile,
  };

  return interactionWithProfile;
}
