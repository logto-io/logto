import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

const getUserIdentity = (user: User) => {
  const { primaryEmail, primaryPhone, username } = user;
  return primaryEmail ?? primaryPhone ?? username;
};

export const getUserTitle = (user: User) => user.name ?? getUserIdentity(user);

export const getUserSubtitle = (user: User) => conditional(user.name && getUserIdentity(user));
