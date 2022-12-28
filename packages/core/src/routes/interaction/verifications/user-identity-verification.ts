import { deduplicate } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { findSocialRelatedUser } from '#src/libraries/social.js';
import assertThat from '#src/utils/assert-that.js';
import { maskUserInfo } from '#src/utils/format.js';

import type {
  SocialIdentifier,
  VerifiedEmailIdentifier,
  VerifiedPhoneIdentifier,
  SignInInteractionResult,
  ForgotPasswordInteractionResult,
  AccountVerifiedInteractionResult,
  Identifier,
} from '../types/index.js';
import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import { isAccountVerifiedInteractionResult, categorizeIdentifiers } from '../utils/interaction.js';

const identifyUserByVerifiedEmailOrPhone = async (
  identifier: VerifiedEmailIdentifier | VerifiedPhoneIdentifier
) => {
  const user = await findUserByIdentifier(
    identifier.key === 'emailVerified' ? { email: identifier.value } : { phone: identifier.value }
  );

  assertThat(
    user,
    new RequestError({ code: 'user.user_not_exist', status: 404 }, { identity: identifier.value })
  );

  const { id, isSuspended } = user;

  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return id;
};

const identifyUserBySocialIdentifier = async (identifier: SocialIdentifier) => {
  const { connectorId, userInfo } = identifier;

  const user = await findUserByIdentifier({ connectorId, userInfo });

  if (!user) {
    const relatedInfo = await findSocialRelatedUser(userInfo);

    throw new RequestError(
      {
        code: 'user.identity_not_exist',
        status: 422,
      },
      relatedInfo && { relatedUser: maskUserInfo(relatedInfo[0]) }
    );
  }

  const { id, isSuspended } = user;

  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return id;
};

const identifyUser = async (identifier: Identifier) => {
  if (identifier.key === 'social') {
    return identifyUserBySocialIdentifier(identifier);
  }

  if (identifier.key === 'accountId') {
    return identifier.value;
  }

  return identifyUserByVerifiedEmailOrPhone(identifier);
};

export default async function verifyUserAccount(
  interaction: SignInInteractionResult | ForgotPasswordInteractionResult
): Promise<AccountVerifiedInteractionResult> {
  const { identifiers = [], accountId, profile } = interaction;

  const { userAccountIdentifiers, profileIdentifiers } = categorizeIdentifiers(
    identifiers,
    profile
  );

  // Return the interaction directly if it is accountVerified and has no unverified userAccountIdentifiers
  // e.g. profile fulfillment request with account already verified in the interaction result
  if (isAccountVerifiedInteractionResult(interaction) && userAccountIdentifiers.length === 0) {
    return interaction;
  }

  // _userAccountIdentifiers is required to identify a user account
  assertThat(
    userAccountIdentifiers.length > 0,
    new RequestError({
      code: 'session.identifier_not_found',
      status: 404,
    })
  );

  // Verify userAccountIdentifiers
  const accountIds = await Promise.all(
    userAccountIdentifiers.map(async (identifier) => identifyUser(identifier))
  );
  const deduplicateAccountIds = deduplicate(accountIds);

  // Inconsistent account identifiers check
  assertThat(deduplicateAccountIds.length === 1, new RequestError('session.verification_failed'));

  // Valid accountId verification. Should also equal to the accountId in record if exist. Else throw
  assertThat(
    deduplicateAccountIds[0] && (!accountId || accountId === deduplicateAccountIds[0]),
    new RequestError('session.verification_failed')
  );

  // Return the verified interaction and remove the consumed userAccountIdentifiers
  return {
    ...interaction,
    identifiers: profileIdentifiers,
    accountId: deduplicateAccountIds[0],
  };
}
