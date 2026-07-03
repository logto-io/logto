import { conditional } from '@silverhand/essentials';

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
