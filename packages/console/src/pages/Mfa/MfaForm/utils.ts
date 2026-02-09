import { type AdaptiveMfa, MfaFactor, MfaPolicy } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type SignInPrompt, type MfaConfig, type MfaConfigForm } from '../types';

export enum MfaRequirementMode {
  Optional = 'optional',
  Adaptive = 'adaptive',
  Mandatory = 'mandatory',
}

export const getMfaRequirementMode = ({
  isMandatory,
  adaptiveMfaEnabled,
}: Pick<MfaConfigForm, 'isMandatory' | 'adaptiveMfaEnabled'>): MfaRequirementMode => {
  if (isMandatory) {
    return MfaRequirementMode.Mandatory;
  }

  if (adaptiveMfaEnabled) {
    return MfaRequirementMode.Adaptive;
  }

  return MfaRequirementMode.Optional;
};

export const getMfaRequirementState = (
  mode: MfaRequirementMode
): Pick<MfaConfigForm, 'isMandatory' | 'adaptiveMfaEnabled'> => {
  if (mode === MfaRequirementMode.Mandatory) {
    return {
      isMandatory: true,
      adaptiveMfaEnabled: false,
    };
  }

  if (mode === MfaRequirementMode.Adaptive) {
    return {
      isMandatory: false,
      adaptiveMfaEnabled: true,
    };
  }

  return {
    isMandatory: false,
    adaptiveMfaEnabled: false,
  };
};

const isSignInPrompt = (policy: MfaPolicy): policy is SignInPrompt =>
  [MfaPolicy.NoPrompt, MfaPolicy.PromptAtSignInAndSignUp, MfaPolicy.PromptOnlyAtSignIn].includes(
    policy
  );

export const convertMfaConfigToForm = (
  { policy, factors, organizationRequiredMfaPolicy }: MfaConfig,
  adaptiveMfa?: AdaptiveMfa
): MfaConfigForm => ({
  isMandatory: policy === MfaPolicy.Mandatory,
  setUpPrompt: isSignInPrompt(policy) ? policy : MfaPolicy.PromptAtSignInAndSignUp,
  totpEnabled: factors.includes(MfaFactor.TOTP),
  webAuthnEnabled: factors.includes(MfaFactor.WebAuthn),
  backupCodeEnabled: factors.includes(MfaFactor.BackupCode),
  emailVerificationCodeEnabled: factors.includes(MfaFactor.EmailVerificationCode),
  phoneVerificationCodeEnabled: factors.includes(MfaFactor.PhoneVerificationCode),
  organizationRequiredMfaPolicy,
  adaptiveMfaEnabled: Boolean(adaptiveMfa?.enabled),
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

export const buildMfaPatchPayload = (
  mfaConfigForm: MfaConfigForm,
  isDevFeaturesEnabled: boolean
): { mfa: MfaConfig; adaptiveMfa?: AdaptiveMfa } => {
  const mfa = convertMfaFormToConfig(mfaConfigForm);

  return {
    mfa,
    ...conditional(
      isDevFeaturesEnabled && { adaptiveMfa: { enabled: mfaConfigForm.adaptiveMfaEnabled } }
    ),
  };
};
