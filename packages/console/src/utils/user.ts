import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { t } from 'i18next';

import { formatToInternationalPhoneNumber } from './phone';

const getSecondaryUserInfo = (user?: User) => {
  const { primaryEmail, primaryPhone, username } = user ?? {};
  const formattedPhoneNumber = conditional(
    primaryPhone && formatToInternationalPhoneNumber(primaryPhone)
  );
  return primaryEmail ?? formattedPhoneNumber ?? username;
};

export const getUserTitle = (user?: User) =>
  user?.name ?? getSecondaryUserInfo(user) ?? t('admin_console.users.unnamed');

export const getUserSubtitle = (user?: User) =>
  conditional(user?.name && getSecondaryUserInfo(user));
