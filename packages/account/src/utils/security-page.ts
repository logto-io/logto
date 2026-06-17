import type { SignInExperienceResponse } from '@experience/shared/types';
import type {
  AccountCenter,
  UserMfaVerificationResponse,
  UserProfileResponse,
} from '@logto/schemas';
import { AccountCenterControlValue, MfaFactor } from '@logto/schemas';

import { isDevFeaturesEnabled } from '@ac/constants/env';

import { getAvailableSocialConnectors } from './social-connector.js';

type SecurityPageSettings = Pick<AccountCenter, 'enabled' | 'fields' | 'deleteAccountUrl'>;
type SecurityPageExperienceSettings = Pick<SignInExperienceResponse, 'socialConnectors' | 'mfa'> &
  Partial<Pick<SignInExperienceResponse, 'passkeySignIn'>>;

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

export const isPasskeySignInEnabled = (
  experienceSettings?: SecurityPageExperienceSettings
): boolean => isDevFeaturesEnabled && Boolean(experienceSettings?.passkeySignIn?.enabled);

export const hasVisibleMfaSection = (
  mfaControl: AccountCenterControlValue | undefined,
  experienceSettings?: SecurityPageExperienceSettings
): boolean => isVisibleField(mfaControl) && (experienceSettings?.mfa.factors ?? []).length > 0;

/**
 * Resolve the account-center control for the dedicated passkey section. Passkey shares the
 * MFA control until a dedicated `passkey` field control is configured.
 */
export const getPasskeyFieldControl = (
  passkeyControl: AccountCenterControlValue | undefined,
  mfaControl: AccountCenterControlValue | undefined
): AccountCenterControlValue | undefined => passkeyControl ?? mfaControl;

export const hasVisiblePasskeySection = (
  passkeyControl: AccountCenterControlValue | undefined,
  experienceSettings?: SecurityPageExperienceSettings
): boolean => isVisibleField(passkeyControl) && isPasskeySignInEnabled(experienceSettings);

/**
 * Whether the user has configured a verification method that counts as a real second factor.
 * When passkey sign-in is enabled, a WebAuthn credential acts as a sign-in passkey rather than a
 * dedicated second factor, so it is excluded here. This mirrors the backend's additional-MFA
 * suggestion logic, which does not treat WebAuthn as a standalone MFA factor while passkey sign-in
 * is on.
 */
export const hasConfiguredSecondFactor = (
  mfaVerifications: UserMfaVerificationResponse | undefined,
  experienceSettings?: SecurityPageExperienceSettings
): boolean => {
  const verifications = mfaVerifications ?? [];
  if (isPasskeySignInEnabled(experienceSettings)) {
    return verifications.some((verification) => verification.type !== MfaFactor.WebAuthn);
  }
  return verifications.length > 0;
};

export const hasVisibleSecuritySection = (
  accountCenterSettings?: SecurityPageSettings,
  experienceSettings?: SecurityPageExperienceSettings
): boolean => {
  if (!accountCenterSettings?.enabled) {
    return false;
  }

  const { username, email, phone, password, social, mfa, passkey } = accountCenterSettings.fields;
  const hasDeleteAccountUrl = Boolean(accountCenterSettings.deleteAccountUrl?.trim());

  return (
    isVisibleField(username) ||
    isVisibleField(email) ||
    isVisibleField(phone) ||
    isVisibleField(password) ||
    hasDeleteAccountUrl ||
    hasVisibleSocialSection(social, experienceSettings) ||
    hasVisibleMfaSection(mfa, experienceSettings) ||
    hasVisiblePasskeySection(getPasskeyFieldControl(passkey, mfa), experienceSettings)
  );
};

export const hasVisibleSessionsPage = (accountCenterSettings?: SecurityPageSettings): boolean => {
  if (!accountCenterSettings?.enabled) {
    return false;
  }

  return isVisibleField(accountCenterSettings.fields.session);
};

export const hasAvailableSecurityVerificationMethod = (
  userInfo?: Partial<UserProfileResponse>
): boolean =>
  Boolean(userInfo?.hasPassword) ||
  Boolean(userInfo?.primaryEmail) ||
  Boolean(userInfo?.primaryPhone);

export const canManageSocialIdentitiesWithoutVerification = (
  userInfo?: Partial<UserProfileResponse>
): boolean => userInfo?.hasSecurityVerificationMethod === false;

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
