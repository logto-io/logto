import { UserScope } from '@logto/core-kit';
import { type UserProfileResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import type Libraries from '../../../tenants/Libraries.js';
import type Queries from '../../../tenants/Queries.js';
import { transpileUserProfileResponse } from '../../../utils/user.js';

/**
 * Get the user profile, and filter the fields according to the scopes.
 * The scopes and fields are defined in the core-kit, see packages/toolkit/core-kit/src/openid.ts
 */
export const getScopedProfile = async (
  queries: Queries,
  libraries: Libraries,
  scopes: Set<string>,
  userId: string
): Promise<Partial<UserProfileResponse>> => {
  const user = await queries.users.findUserById(userId);

  const ssoIdentities = scopes.has(UserScope.Identities) && [
    ...(await libraries.users.findUserSsoIdentities(userId)),
  ];

  const {
    id,
    username,
    primaryEmail,
    primaryPhone,
    name,
    avatar,
    customData,
    identities,
    lastSignInAt,
    createdAt,
    updatedAt,
    profile: { address, ...restProfile },
    applicationId,
    isSuspended,
    hasPassword,
  } = transpileUserProfileResponse(user);

  return {
    id,
    ...conditional(ssoIdentities),
    ...conditional(scopes.has(UserScope.Identities) && { identities }),
    ...conditional(scopes.has(UserScope.CustomData) && { customData }),
    ...conditional(scopes.has(UserScope.Email) && { primaryEmail }),
    ...conditional(scopes.has(UserScope.Phone) && { primaryPhone }),
    ...conditional(
      // Basic profile and all custom claims not defined in the scope are included
      scopes.has(UserScope.Profile) && {
        name,
        avatar,
        username,
        profile: {
          ...restProfile,
          ...conditional(scopes.has(UserScope.Address) && { address }),
        },
        lastSignInAt,
        createdAt,
        updatedAt,
        applicationId,
        isSuspended,
        hasPassword,
      }
    ),
  };
};
