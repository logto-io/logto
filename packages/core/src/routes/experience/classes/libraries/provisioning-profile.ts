import { conditional } from '@silverhand/essentials';

import { type InteractionProfile, type InteractionUserProvisioningProfile } from '../../types.js';

type IdentifierCollisionProfile = InteractionUserProvisioningProfile &
  Partial<Pick<InteractionProfile, 'socialIdentity'>>;

export const getProfileIdentifierCollisionPayload = ({
  socialIdentity,
  username,
  primaryEmail,
  primaryPhone,
}: IdentifierCollisionProfile) => ({
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
