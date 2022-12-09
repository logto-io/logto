import { deduplicate } from '@silverhand/essentials';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { findSocialRelatedUser } from '#src/lib/social.js';
import assertThat from '#src/utils/assert-that.js';
import { maskUserInfo } from '#src/utils/format.js';

import type {
  SocialIdentifier,
  VerifiedEmailIdentifier,
  VerifiedPhoneIdentifier,
  PreAccountVerifiedInteractionResult,
  AccountVerifiedInteractionResult,
  Identifier,
  InteractionContext,
} from '../types/index.js';
import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import {
  storeInteractionResult,
  isAccountVerifiedInteractionResult,
  categorizeIdentifiers,
} from '../utils/interaction.js';

const identifyUserByVerifiedEmailOrPhone = async (
  identifier: VerifiedEmailIdentifier | VerifiedPhoneIdentifier
) => {
  const user = await findUserByIdentifier(
    identifier.key === 'emailVerified' ? { email: identifier.value } : { phone: identifier.value }
  );

  assertThat(
    user,
    new RequestError({ code: 'user.user_not_exist', status: 404 }, { identifier: identifier.value })
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

export default async function userAccountVerification(
  interaction: PreAccountVerifiedInteractionResult,
  ctx: InteractionContext,
  provider: Provider
): Promise<AccountVerifiedInteractionResult> {
  const { identifiers = [], accountId, profile } = interaction;

  const { userAccountIdentifiers, profileIdentifiers } = categorizeIdentifiers(
    identifiers,
    // Need to merge the profile in payload
    { ...profile, ...ctx.interactionPayload.profile }
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
      code: 'session.verification_session_not_found',
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

  // Assign the verification result and store the profile identifiers left
  const verifiedInteraction: AccountVerifiedInteractionResult = {
    ...interaction,
    identifiers: profileIdentifiers,
    accountId: deduplicateAccountIds[0],
  };

  await storeInteractionResult(verifiedInteraction, ctx, provider);

  return verifiedInteraction;
}
