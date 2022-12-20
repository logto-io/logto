import type { User } from '@logto/schemas';
import { z } from 'zod';

import type { UserDetailsForm } from './types';

export const userDetailsParser = {
  toLocalForm: (data: User): UserDetailsForm => {
    const { primaryEmail, primaryPhone, username, name, avatar, roleNames, customData } = data;

    return {
      primaryEmail: primaryEmail ?? '',
      primaryPhone: primaryPhone ?? '',
      username: username ?? '',
      name: name ?? '',
      avatar: avatar ?? '',
      roleNames,
      customData: JSON.stringify(customData, null, 2),
    };
  },
};

const userDetailsPageStateGuard = z.object({
  password: z.string(),
});

export type UserDetailsPageState = z.infer<typeof userDetailsPageStateGuard>;

export const isUserDetailsPageState = (value: unknown): value is UserDetailsPageState => {
  const { success } = userDetailsPageStateGuard.safeParse(value);

  return success;
};
