import { deduplicate } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
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
import { categorizeIdentifiers } from '../utils/interaction.js';

const identifyUserByVerifiedEmailOrPhone = async (
  tenant: TenantContext,
  identifier: VerifiedEmailIdentifier | VerifiedPhoneIdentifier
) => {
  const user = await findUserByIdentifier(
    tenant,
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

const identifyUserBySocialIdentifier = async (
  tenant: TenantContext,
  identifier: SocialIdentifier
) => {
  const { connectorId, userInfo } = identifier;

  const user = await findUserByIdentifier(tenant, { connectorId, userInfo });

  if (!user) {
    const relatedInfo = await tenant.libraries.socials.findSocialRelatedUser(userInfo);

    throw new RequestError(
      {
        code: 'user.identity_not_exist',
        status: 422,
      },
      {
        ...(relatedInfo && { relatedUser: maskUserInfo(relatedInfo[0]) }),
        ...(userInfo.email && { email: userInfo.email }),
        ...(userInfo.phone && { phone: userInfo.phone }),
      }
    );
  }

  const { id, isSuspended } = user;

  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return id;
};

const identifyUser = async (tenant: TenantContext, identifier: Identifier) => {
  if (identifier.key === 'social') {
    return identifyUserBySocialIdentifier(tenant, identifier);
  }

  if (identifier.key === 'accountId') {
    return identifier.value;
  }

  return identifyUserByVerifiedEmailOrPhone(tenant, identifier);
};

export default async function verifyUserAccount(
  tenant: TenantContext,
  interaction: SignInInteractionResult | ForgotPasswordInteractionResult
): Promise<AccountVerifiedInteractionResult> {
  const { identifiers = [], accountId, profile } = interaction;

  // Only verify authIdentifiers, should ignore those profile identifiers
  const { authIdentifiers } = categorizeIdentifiers(identifiers, profile);

  // _authIdentifiers is required to identify a user account
  assertThat(
    authIdentifiers.length > 0,
    new RequestError({
      code: 'session.identifier_not_found',
      status: 404,
    })
  );

  // Verify authIdentifiers
  const accountIds = await Promise.all(
    authIdentifiers.map(async (identifier) => identifyUser(tenant, identifier))
  );
  const deduplicateAccountIds = deduplicate(accountIds);

  // Inconsistent account identifiers check
  assertThat(deduplicateAccountIds.length === 1, new RequestError('session.verification_failed'));

  // Valid accountId verification. Should also equal to the accountId in record if exist. Else throw
  assertThat(
    deduplicateAccountIds[0] && (!accountId || accountId === deduplicateAccountIds[0]),
    new RequestError('session.verification_failed')
  );

  return {
    ...interaction,
    identifiers,
    accountId: deduplicateAccountIds[0],
  };
}
