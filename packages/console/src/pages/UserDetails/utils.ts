import type { User } from '@logto/schemas';

import type { UserDetailsForm } from './types';

export const userDetailsParser = {
  toLocalForm: (data: User): UserDetailsForm => {
    const { primaryEmail, primaryPhone, username, name, avatar, customData } = data;

    return {
      primaryEmail: primaryEmail ?? '',
      primaryPhone: primaryPhone ?? '',
      username: username ?? '',
      name: name ?? '',
      avatar: avatar ?? '',
      customData: JSON.stringify(customData, null, 2),
    };
  },
};
