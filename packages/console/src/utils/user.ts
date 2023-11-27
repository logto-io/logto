import type { User } from '@logto/schemas';
import { getUserDisplayName } from '@logto/shared/universal';
import { t } from 'i18next';

export const getUserTitle = (user?: User): string =>
  (user ? getUserDisplayName(user) : undefined) ?? t('admin_console.users.unnamed');

export const getUserSubtitle = (user?: User) => {
  if (!user?.name) {
    return;
  }

  const { username, primaryEmail, primaryPhone } = user;

  return getUserDisplayName({ username, primaryEmail, primaryPhone });
};
