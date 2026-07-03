import { conditional } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

import { type InteractionProfile } from '../../types.js';

export const getProfileIdentifierCollisionPayload = ({
  socialIdentity,
  username,
  primaryEmail,
  primaryPhone,
}: InteractionProfile) => ({
  username,
  primaryEmail,
  primaryPhone,
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
