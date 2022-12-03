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

import { registerProfileSafeGuard } from '../types/guard.js';
import type {
  InteractionContext,
  Identifier,
  SocialIdentifier,
  IdentifierVerifiedInteractionResult,
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

const profileRegisteredValidation = async (
  { username, email, phone, connectorId }: Profile,
  identifiers: Identifier[] = []
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

    // Social identifier session should be verified by verifyProfileIdentifiers
    if (!socialIdentifier) {
      return;
    }

    assertThat(
      !(await hasUserWithIdentity(target, socialIdentifier.userInfo.id)),
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

// eslint-disable-next-line complexity
export default async function profileVerification(
  ctx: InteractionContext,
  provider: Provider,
  interaction: IdentifierVerifiedInteractionResult
): Promise<IdentifierVerifiedInteractionResult> {
  if (!interaction.profile && !ctx.interactionPayload.profile) {
    return interaction;
  }

  const profile = { ...interaction.profile, ...ctx.interactionPayload.profile };

  const { event, identifiers, accountId } = interaction;

  switch (event) {
    case Event.Register: {
      // Verify the profile includes sufficient identifiers to register a new account
      try {
        registerProfileSafeGuard.parse(profile);
      } catch (error: unknown) {
        throw new RequestError({ code: 'guard.invalid_input' }, error);
      }

      verifyProfileIdentifiers(profile, identifiers);
      await profileRegisteredValidation(profile, identifiers);
      break;
    }

    case Event.SignIn: {
      verifyProfileIdentifiers(profile, identifiers);
      // Find existing account
      const user = await findUserById(accountId);
      await profileExistValidation(profile, user);
      await profileRegisteredValidation(profile, identifiers);
      break;
    }

    case Event.ForgotPassword: {
      // Forgot Password
      const { password } = profile;

      if (password) {
        const { passwordEncrypted: oldPasswordEncrypted } = await findUserById(accountId);

        assertThat(
          !oldPasswordEncrypted || !(await argon2Verify({ password, hash: oldPasswordEncrypted })),
          new RequestError({ code: 'user.same_password', status: 422 })
        );
      }

      break;
    }
    default:
      break;
  }

  const interactionWithProfile = { ...interaction, profile };
  await storeInteractionResult(interactionWithProfile, ctx, provider);

  return interactionWithProfile;
}
