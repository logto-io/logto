import type { UserProfileResponse } from '@logto/schemas';
import { formatToInternationalPhoneNumber } from '@logto/shared/universal';
import { conditional } from '@silverhand/essentials';

import type { UserDetailsForm } from './types';

export const userDetailsParser = {
  toLocalForm: (data: UserProfileResponse): UserDetailsForm => {
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
