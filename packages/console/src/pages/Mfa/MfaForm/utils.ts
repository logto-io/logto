import {
  type AdaptiveMfa,
  MfaFactor,
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import {
  type MfaPromptMandatory,
  type OptionalMfaPrompt,
  type MfaConfig,
  type MfaConfigForm,
} from '../types';

export enum MfaRequirementMode {
  Optional = 'optional',
  Adaptive = 'adaptive',
  Required = 'required',
}

export const getMfaRequirementMode = ({
  isMandatory,
  adaptiveMfaEnabled,
}: Pick<MfaConfigForm, 'isMandatory' | 'adaptiveMfaEnabled'>): MfaRequirementMode => {
  if (isMandatory) {
    return MfaRequirementMode.Required;
  }

  if (adaptiveMfaEnabled) {
    return MfaRequirementMode.Adaptive;
  }

  return MfaRequirementMode.Optional;
};

export const getMfaRequirementState = (
  mode: MfaRequirementMode
): Pick<MfaConfigForm, 'isMandatory' | 'adaptiveMfaEnabled'> => {
  if (mode === MfaRequirementMode.Required) {
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

const isOptionalMfaPrompt = (policy: MfaPolicy): policy is OptionalMfaPrompt =>
  [MfaPolicy.NoPrompt, MfaPolicy.PromptAtSignInAndSignUp, MfaPolicy.PromptOnlyAtSignIn].includes(
    policy
  );

const isNonSkippableMfaPrompt = (policy: MfaPolicy): policy is MfaPromptMandatory =>
  [MfaPolicy.PromptAtSignInAndSignUpMandatory, MfaPolicy.PromptOnlyAtSignInMandatory].includes(
    policy
  );

const isMandatoryModePolicy = (policy: MfaPolicy): boolean =>
  policy === MfaPolicy.Mandatory || isNonSkippableMfaPrompt(policy);

const normalizeSetUpPrompt = (policy: MfaPolicy, requireNonSkippablePrompt: boolean) => {
  if (requireNonSkippablePrompt) {
    return isNonSkippableMfaPrompt(policy) ? policy : MfaPolicy.PromptAtSignInAndSignUpMandatory;
  }

  return isOptionalMfaPrompt(policy) ? policy : MfaPolicy.PromptAtSignInAndSignUp;
};

export const normalizeSetUpPromptByRequirementMode = (
  policy: MfaPolicy,
  mode: MfaRequirementMode
) => {
  if (mode === MfaRequirementMode.Optional) {
    return isOptionalMfaPrompt(policy) ? policy : MfaPolicy.NoPrompt;
  }

  return normalizeSetUpPrompt(policy, true);
};

export const convertMfaConfigToForm = (
  { policy, factors, organizationRequiredMfaPolicy }: MfaConfig,
  adaptiveMfa?: AdaptiveMfa
): MfaConfigForm => {
  const adaptiveMfaEnabled = Boolean(adaptiveMfa?.enabled);
  const isMandatory = !adaptiveMfaEnabled && isMandatoryModePolicy(policy);
  const normalizedOrganizationRequiredMfaPolicy = isMandatory
    ? OrganizationRequiredMfaPolicy.NoPrompt
    : organizationRequiredMfaPolicy;

  return {
    isMandatory,
    setUpPrompt: normalizeSetUpPrompt(policy, adaptiveMfaEnabled || isMandatory),
    totpEnabled: factors.includes(MfaFactor.TOTP),
    webAuthnEnabled: factors.includes(MfaFactor.WebAuthn),
    backupCodeEnabled: factors.includes(MfaFactor.BackupCode),
    emailVerificationCodeEnabled: factors.includes(MfaFactor.EmailVerificationCode),
    phoneVerificationCodeEnabled: factors.includes(MfaFactor.PhoneVerificationCode),
    organizationRequiredMfaPolicy: normalizedOrganizationRequiredMfaPolicy,
    adaptiveMfaEnabled,
  };
};

export const convertMfaFormToConfig = (mfaConfigForm: MfaConfigForm): MfaConfig => {
  const {
    isMandatory,
    adaptiveMfaEnabled,
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

  const shouldIncludeOrganizationRequiredMfaPolicy =
    !isMandatory && !adaptiveMfaEnabled && Boolean(organizationRequiredMfaPolicy);

  return {
    policy: normalizeSetUpPrompt(setUpPrompt, isMandatory || adaptiveMfaEnabled),
    factors,
    ...conditional(shouldIncludeOrganizationRequiredMfaPolicy && { organizationRequiredMfaPolicy }),
  };
};

export const validateBackupCodeFactor = (factors: MfaFactor[]): boolean => {
  return !(factors.length === 1 && factors.includes(MfaFactor.BackupCode));
};

export const buildMfaPatchPayload = (
  mfaConfigForm: MfaConfigForm,
  isDevFeaturesEnabled: boolean
): { mfa: MfaConfig; adaptiveMfa: AdaptiveMfa } => {
  const mfa = convertMfaFormToConfig(mfaConfigForm);
  const legacyMfa = mfaConfigForm.isMandatory ? { ...mfa, policy: MfaPolicy.Mandatory } : mfa;

  return {
    mfa: isDevFeaturesEnabled ? mfa : legacyMfa,
    adaptiveMfa: { enabled: isDevFeaturesEnabled && mfaConfigForm.adaptiveMfaEnabled },
  };
};
