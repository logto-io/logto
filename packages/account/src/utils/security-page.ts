import type { SignInExperienceResponse } from '@experience/shared/types';
import type {
  AccountCenter,
  CustomProfileField,
  UserMfaVerificationResponse,
  UserProfileResponse,
} from '@logto/schemas';
import { AccountCenterControlValue, MfaFactor } from '@logto/schemas';

import { getProfileFieldControlKey } from './profile-field-control';
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
): boolean => Boolean(experienceSettings?.passkeySignIn?.enabled);

/**
 * Whether a WebAuthn passkey credential can be registered or managed. Mirrors the backend binding
 * rule: WebAuthn is configurable when it is an enabled MFA factor, or when passkey sign-in is
 * enabled (the passkey then doubles as the sign-in credential).
 */
export const isWebAuthnConfigurable = (
  experienceSettings?: SecurityPageExperienceSettings
): boolean =>
  (experienceSettings?.mfa.factors ?? []).includes(MfaFactor.WebAuthn) ||
  isPasskeySignInEnabled(experienceSettings);

/**
 * Whether the sign-in experience enables at least one real second factor. When passkey sign-in is
 * enabled, WebAuthn acts as a sign-in passkey (surfaced in its own passkey section) rather than a
 * standalone second factor, so it does not count here. This mirrors the backend, which does not
 * treat WebAuthn as a standalone MFA factor while passkey sign-in is on.
 */
export const hasEnabledSecondFactor = (
  experienceSettings?: SecurityPageExperienceSettings
): boolean => {
  const factors = experienceSettings?.mfa.factors ?? [];
  if (isPasskeySignInEnabled(experienceSettings)) {
    return factors.some((factor) => factor !== MfaFactor.WebAuthn);
  }
  return factors.length > 0;
};

export const hasVisibleMfaSection = (
  mfaControl: AccountCenterControlValue | undefined,
  experienceSettings?: SecurityPageExperienceSettings
): boolean => isVisibleField(mfaControl) && hasEnabledSecondFactor(experienceSettings);

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

type ProfilePageSettings = Pick<AccountCenter, 'enabled' | 'fields' | 'profileFields'>;
type ProfilePageExperienceSettings = Partial<
  Pick<SignInExperienceResponse, 'customProfileFieldCatalog' | 'customProfileFields'>
>;

export const hasVisibleProfilePage = (
  accountCenterSettings?: ProfilePageSettings,
  experienceSettings?: ProfilePageExperienceSettings
): boolean => {
  if (!accountCenterSettings?.enabled) {
    return false;
  }

  const profileFields = accountCenterSettings.profileFields ?? [];

  if (profileFields.length === 0) {
    return false;
  }

  const catalog =
    experienceSettings?.customProfileFieldCatalog ?? experienceSettings?.customProfileFields ?? [];
  const catalogMap = new Map<string, CustomProfileField>(
    catalog.map((field) => [field.name, field])
  );

  return profileFields.some(({ name }) => {
    const field = catalogMap.get(name);
    const controlKey = getProfileFieldControlKey(name, field);
    return isVisibleField(accountCenterSettings.fields[controlKey]);
  });
};
