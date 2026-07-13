import { conditional } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

import { type InteractionProfile, type InteractionUserProvisioningProfile } from '../../types.js';

type IdentifierCollisionProfile = InteractionUserProvisioningProfile &
  Partial<Pick<InteractionProfile, 'socialIdentity'>>;

export const getProfileIdentifierCollisionPayload = ({
  socialIdentity,
  username,
  primaryEmail,
  primaryPhone,
}: IdentifierCollisionProfile) => ({
  ...conditional(username !== undefined && { username }),
  ...conditional(primaryEmail !== undefined && { primaryEmail }),
  ...conditional(primaryPhone !== undefined && { primaryPhone }),
  ...conditional(
    socialIdentity && {
      identity: {
        target: socialIdentity.target,
        id: socialIdentity.userInfo.id,
      },
    }
  ),
});

export const assertEnterpriseSsoIdentityAvailable = async (
  userSsoIdentitiesQueries: Queries['userSsoIdentities'],
  enterpriseSsoIdentity?: InteractionProfile['enterpriseSsoIdentity']
) => {
  if (!enterpriseSsoIdentity) {
    return;
  }

  const { issuer, identityId } = enterpriseSsoIdentity;
  const existingSsoIdentity = await userSsoIdentitiesQueries.findUserSsoIdentityBySsoIdentityId(
    issuer,
    identityId
  );

  if (existingSsoIdentity) {
    throw new RequestError({
      code: 'user.identity_already_in_use',
      status: 422,
    });
  }
};
