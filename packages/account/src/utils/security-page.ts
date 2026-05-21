import type { SignInExperienceResponse } from '@experience/shared/types';
import type { AccountCenter, UserProfileResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';

import { getAvailableSocialConnectors } from './social-connector.js';

type SecurityPageSettings = Pick<AccountCenter, 'enabled' | 'fields' | 'deleteAccountUrl'>;
type SecurityPageExperienceSettings = Pick<SignInExperienceResponse, 'socialConnectors' | 'mfa'>;

const isVisibleField = (value?: AccountCenterControlValue): boolean =>
  value !== undefined && value !== AccountCenterControlValue.Off;

const isReadableField = (value?: AccountCenterControlValue): boolean =>
  value === AccountCenterControlValue.ReadOnly || value === AccountCenterControlValue.Edit;

export const isEditableField = (value?: AccountCenterControlValue): boolean =>
  value === AccountCenterControlValue.Edit;

export const hasVisibleSocialSection = (
  socialControl: AccountCenterControlValue | undefined,
  experienceSettings?: SecurityPageExperienceSettings
): boolean =>
  isVisibleField(socialControl) &&
  getAvailableSocialConnectors(experienceSettings?.socialConnectors ?? []).length > 0;

export const hasVisibleMfaSection = (
  mfaControl: AccountCenterControlValue | undefined,
  experienceSettings?: SecurityPageExperienceSettings
): boolean => isVisibleField(mfaControl) && (experienceSettings?.mfa.factors ?? []).length > 0;

export const hasVisibleSecuritySection = (
  accountCenterSettings?: SecurityPageSettings,
  experienceSettings?: SecurityPageExperienceSettings
): boolean => {
  if (!accountCenterSettings?.enabled) {
    return false;
  }

  const { username, email, phone, password, social, mfa } = accountCenterSettings.fields;
  const hasDeleteAccountUrl = Boolean(accountCenterSettings.deleteAccountUrl?.trim());

  return (
    isVisibleField(username) ||
    isVisibleField(email) ||
    isVisibleField(phone) ||
    isVisibleField(password) ||
    hasDeleteAccountUrl ||
    hasVisibleSocialSection(social, experienceSettings) ||
    hasVisibleMfaSection(mfa, experienceSettings)
  );
};

export const hasAvailableSecurityVerificationMethod = (
  userInfo?: Partial<UserProfileResponse>
): boolean =>
  Boolean(userInfo?.hasPassword) ||
  Boolean(userInfo?.primaryEmail) ||
  Boolean(userInfo?.primaryPhone);

export const canSetInitialPasswordWithoutVerification = (
  userInfo?: Partial<UserProfileResponse>,
  accountCenterFields?: AccountCenter['fields']
): boolean => {
  if (userInfo?.hasPassword !== false) {
    return false;
  }
  if (Boolean(userInfo.primaryEmail) || Boolean(userInfo.primaryPhone)) {
    return false;
  }
  if (
    accountCenterFields !== undefined &&
    (!isReadableField(accountCenterFields.email) || !isReadableField(accountCenterFields.phone))
  ) {
    return false;
  }
  return true;
};

export const canOpenPasswordEditFlow = (
  passwordControl: AccountCenterControlValue | undefined,
  userInfo?: Partial<UserProfileResponse>,
  accountCenterFields?: AccountCenter['fields']
): boolean =>
  isEditableField(passwordControl) &&
  userInfo !== undefined &&
  (hasAvailableSecurityVerificationMethod(userInfo) ||
    canSetInitialPasswordWithoutVerification(userInfo, accountCenterFields));
