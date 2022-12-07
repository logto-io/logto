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
import { isProfileIdentifier } from '../utils/index.js';
import {
  storeInteractionResult,
  isAccountVerifiedInteractionResult,
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
        code: 'user.identity_not_exists',
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
  const { identifiers = [], accountId } = interaction;
  // Need to merge the profile in payload
  const profile = { ...interaction.profile, ...ctx.interactionPayload.profile };

  // Filter all non-profile identifiers
  const userIdentifiers = identifiers.filter(
    (identifier) => !isProfileIdentifier(identifier, profile)
  );

  if (isAccountVerifiedInteractionResult(interaction) && userIdentifiers.length === 0) {
    return interaction;
  }

  assertThat(
    userIdentifiers.length > 0,
    new RequestError({
      code: 'session.unauthorized',
      status: 401,
    })
  );

  // Verify All non-profile identifiers
  const accountIds = await Promise.all(
    userIdentifiers.map(async (identifier) => identifyUser(identifier))
  );

  const deduplicateAccountIds = deduplicate(accountIds);

  // Inconsistent identities
  assertThat(
    deduplicateAccountIds.length === 1 &&
      deduplicateAccountIds[0] &&
      (!accountId || accountId === deduplicateAccountIds[0]),
    new RequestError('session.verification_failed')
  );

  // Assign verification result and filter out account verified identifiers
  const verifiedInteraction: AccountVerifiedInteractionResult = {
    ...interaction,
    identifiers: identifiers.filter((identifier) => isProfileIdentifier(identifier, profile)),
    accountId: deduplicateAccountIds[0],
  };

  await storeInteractionResult(verifiedInteraction, ctx, provider);

  return verifiedInteraction;
}
