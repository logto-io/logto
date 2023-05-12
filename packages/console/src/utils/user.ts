import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { formatToInternationalPhoneNumber } from './phone';

const getUserIdentity = (user: User) => {
  const { primaryEmail, primaryPhone, username } = user;
  const formattedPhoneNumber = conditional(
    primaryPhone && formatToInternationalPhoneNumber(primaryPhone)
  );
  return primaryEmail ?? formattedPhoneNumber ?? username;
};

export const getUserTitle = (user: User) => user.name ?? getUserIdentity(user);

export const getUserSubtitle = (user: User) => conditional(user.name && getUserIdentity(user));
