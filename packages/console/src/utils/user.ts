import { type User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

export const getUserPrimaryIdentity = (user: User) => {
  const { name, primaryEmail, primaryPhone, username } = user;
  return name ?? primaryEmail ?? primaryPhone ?? username ?? undefined;
};

export const getUserSecondaryIdentity = (user: User) => {
  const { name, primaryEmail, primaryPhone, username } = user;

  return conditional(name && (primaryEmail ?? primaryPhone ?? username)) ?? undefined;
};
