import type { AccountCenter, UserProfileResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';

type SecurityPageSettings = Pick<AccountCenter, 'enabled' | 'fields'>;

const isVisibleField = (value?: AccountCenterControlValue): boolean =>
  value !== undefined && value !== AccountCenterControlValue.Off;

export const hasVisibleSecuritySection = (
  accountCenterSettings?: SecurityPageSettings
): boolean => {
  if (!accountCenterSettings?.enabled) {
    return false;
  }

  const { username, email, phone, password, social } = accountCenterSettings.fields;

  return (
    isVisibleField(username) ||
    isVisibleField(email) ||
    isVisibleField(phone) ||
    isVisibleField(password) ||
    isVisibleField(social)
  );
};

export const canOpenPasswordEditFlow = (
  passwordControl: AccountCenterControlValue | undefined,
  userInfo?: Partial<UserProfileResponse>
): boolean =>
  passwordControl === AccountCenterControlValue.Edit &&
  (Boolean(userInfo?.hasPassword) ||
    Boolean(userInfo?.primaryEmail) ||
    Boolean(userInfo?.primaryPhone));
