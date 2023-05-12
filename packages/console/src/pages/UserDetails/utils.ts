import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { formatToInternationalPhoneNumber } from '@/utils/phone';

import type { UserDetailsForm } from './types';

export const userDetailsParser = {
  toLocalForm: (data: User): UserDetailsForm => {
    const { primaryEmail, primaryPhone, username, name, avatar, customData } = data;
    const parsedPhoneNumber = conditional(
      primaryPhone && formatToInternationalPhoneNumber(primaryPhone)
    );

    return {
      primaryEmail: primaryEmail ?? '',
      primaryPhone: parsedPhoneNumber ?? primaryPhone ?? '',
      username: username ?? '',
      name: name ?? '',
      avatar: avatar ?? '',
      customData: JSON.stringify(customData, null, 2),
    };
  },
};
