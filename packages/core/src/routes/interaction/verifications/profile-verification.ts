import type { Profile, User } from '@logto/schemas';
import { Event } from '@logto/schemas';
import { argon2Verify } from 'hash-wasm';

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

import { registerProfileSafeGuard } from '../types/guard.js';
import type {
  InteractionContext,
  Identifier,
  AccountIdIdentifier,
  SocialIdentifier,
} from '../types/index.js';
import { isUserPasswordSet } from '../utils/index.js';

const findUserByIdentifier = async (identifiers: Identifier[]) => {
  const accountIdentifier = identifiers.find(
    (identifier): identifier is AccountIdIdentifier => identifier.key === 'accountId'
  );

  assertThat(
    accountIdentifier,
    new RequestError({
      code: 'session.unauthorized',
      status: 401,
    })
  );

  return findUserById(accountIdentifier.value);
};

const verifyProtectedIdentifiers = (
  { email, phone, connectorId }: Profile,
  identifiers: Identifier[]
) => {
  if (email) {
    assertThat(
      identifiers.some(({ key, value }) => key === 'emailVerified' && value === email),
      new RequestError({
        code: 'session.verification_session_not_found',
        status: 404,
      })
    );
  }

  if (phone) {
    assertThat(
      identifiers.some(({ key, value }) => key === 'phoneVerified' && value === phone),
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

const profileRegisteredValidation = async (
  { username, email, phone, connectorId }: Profile,
  identifiers: Identifier[]
) => {
  if (username) {
    assertThat(
      !(await hasUser(username)),
      new RequestError({
        code: 'user.username_exists_register',
        status: 422,
      })
    );
  }

  if (email) {
    assertThat(
      !(await hasUserWithEmail(email)),
      new RequestError({
        code: 'user.email_exists_register',
        status: 422,
      })
    );
  }

  if (phone) {
    assertThat(
      !(await hasUserWithPhone(phone)),
      new RequestError({
        code: 'user.phone_exists_register',
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

    // Social identifier session should be verified by verifyProtectedIdentifiers
    if (!socialIdentifier) {
      return;
    }

    assertThat(
      !(await hasUserWithIdentity(target, socialIdentifier.value.id)),
      new RequestError({
        code: 'user.identity_exists',
        status: 422,
      })
    );
  }
};

const profileExistValidation = async (
  { username, email, phone, password }: Profile,
  user: User
) => {
  if (username) {
    assertThat(
      !user.username,
      new RequestError({
        code: 'user.username_exists',
      })
    );
  }

  if (email) {
    assertThat(
      !user.primaryEmail,
      new RequestError({
        code: 'user.email_exists',
      })
    );
  }

  if (phone) {
    assertThat(
      !user.primaryPhone,
      new RequestError({
        code: 'user.sms_exists',
      })
    );
  }

  if (password) {
    assertThat(
      !isUserPasswordSet(user),
      new RequestError({
        code: 'user.password_exists',
      })
    );
  }
};

export default async function profileVerification(
  ctx: InteractionContext,
  identifiers: Identifier[]
): Promise<Profile | undefined> {
  const { profile, event } = ctx.interactionPayload;

  if (!profile) {
    return;
  }

  verifyProtectedIdentifiers(profile, identifiers);

  if (event === Event.SignIn) {
    // Find existing account
    const user = await findUserByIdentifier(identifiers);

    await profileExistValidation(profile, user);
    await profileRegisteredValidation(profile, identifiers);

    return profile;
  }

  if (event === Event.Register) {
    // Verify the profile includes sufficient identifiers to register a new account
    try {
      registerProfileSafeGuard.parse(profile);
    } catch (error: unknown) {
      throw new RequestError({ code: 'guard.invalid_input' }, error);
    }

    await profileRegisteredValidation(profile, identifiers);

    return profile;
  }

  // ForgotPassword
  const { password } = profile;
  const { passwordEncrypted: oldPasswordEncrypted } = await findUserByIdentifier(identifiers);
  assertThat(
    !oldPasswordEncrypted || !(await argon2Verify({ password, hash: oldPasswordEncrypted })),
    new RequestError({ code: 'user.same_password', status: 422 })
  );

  return profile;
}
