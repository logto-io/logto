import { MfaFactor, MfaPolicy } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type SignInPrompt, type MfaConfig, type MfaConfigForm } from '../types';

const isSignInPrompt = (policy: MfaPolicy): policy is SignInPrompt =>
  [MfaPolicy.NoPrompt, MfaPolicy.PromptAtSignInAndSignUp, MfaPolicy.PromptOnlyAtSignIn].includes(
    policy
  );

export const convertMfaConfigToForm = ({
  policy,
  factors,
  organizationRequiredMfaPolicy,
}: MfaConfig): MfaConfigForm => ({
  isMandatory: policy === MfaPolicy.Mandatory,
  setUpPrompt: isSignInPrompt(policy) ? policy : MfaPolicy.PromptAtSignInAndSignUp,
  totpEnabled: factors.includes(MfaFactor.TOTP),
  webAuthnEnabled: factors.includes(MfaFactor.WebAuthn),
  backupCodeEnabled: factors.includes(MfaFactor.BackupCode),
  emailVerificationCodeEnabled: factors.includes(MfaFactor.EmailVerificationCode),
  phoneVerificationCodeEnabled: factors.includes(MfaFactor.PhoneVerificationCode),
  organizationRequiredMfaPolicy,
});

export const convertMfaFormToConfig = (mfaConfigForm: MfaConfigForm): MfaConfig => {
  const {
    isMandatory,
    setUpPrompt,
    totpEnabled,
    webAuthnEnabled,
    backupCodeEnabled,
    emailVerificationCodeEnabled,
    phoneVerificationCodeEnabled,
    organizationRequiredMfaPolicy,
  } = mfaConfigForm;

  const factors = [
    conditional(totpEnabled && MfaFactor.TOTP),
    conditional(webAuthnEnabled && MfaFactor.WebAuthn),
    conditional(backupCodeEnabled && MfaFactor.BackupCode),
    conditional(emailVerificationCodeEnabled && MfaFactor.EmailVerificationCode),
    conditional(phoneVerificationCodeEnabled && MfaFactor.PhoneVerificationCode),
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  ].filter((factor): factor is MfaFactor => Boolean(factor));

  return {
    policy: isMandatory ? MfaPolicy.Mandatory : setUpPrompt,
    factors,
    ...conditional(organizationRequiredMfaPolicy && { organizationRequiredMfaPolicy }),
  };
};

export const validateBackupCodeFactor = (factors: MfaFactor[]): boolean => {
  return !(factors.length === 1 && factors.includes(MfaFactor.BackupCode));
};
