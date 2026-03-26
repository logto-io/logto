import type { SignInExperienceResponse } from '@experience/shared/types';
import type { AccountCenter, UserProfileResponse } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';

import { getAvailableSocialConnectors } from './social-connector.js';

type SecurityPageSettings = Pick<AccountCenter, 'enabled' | 'fields'>;
type SecurityPageExperienceSettings = Pick<SignInExperienceResponse, 'socialConnectors' | 'mfa'>;

const isVisibleField = (value?: AccountCenterControlValue): boolean =>
  value !== undefined && value !== AccountCenterControlValue.Off;

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

  return (
    isVisibleField(username) ||
    isVisibleField(email) ||
    isVisibleField(phone) ||
    isVisibleField(password) ||
    hasVisibleSocialSection(social, experienceSettings) ||
    hasVisibleMfaSection(mfa, experienceSettings)
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
