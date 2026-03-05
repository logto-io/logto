import {
  type OrganizationRequiredMfaPolicy,
  type MfaPolicy,
  type SignInExperience,
} from '@logto/schemas';

export type MfaConfig = SignInExperience['mfa'];
export type OptionalMfaPrompt =
  | MfaPolicy.NoPrompt
  | MfaPolicy.PromptAtSignInAndSignUp
  | MfaPolicy.PromptOnlyAtSignIn;
export type MfaPromptMandatory =
  | MfaPolicy.PromptAtSignInAndSignUpMandatory
  | MfaPolicy.PromptOnlyAtSignInMandatory;
type MfaSetUpPrompt = OptionalMfaPrompt | MfaPromptMandatory;

export type MfaConfigForm = {
  totpEnabled: boolean;
  webAuthnEnabled: boolean;
  backupCodeEnabled: boolean;
  emailVerificationCodeEnabled: boolean;
  phoneVerificationCodeEnabled: boolean;
  isMandatory: boolean;
  setUpPrompt: MfaSetUpPrompt;
  organizationRequiredMfaPolicy?: OrganizationRequiredMfaPolicy;
  adaptiveMfaEnabled: boolean;
};
