import { type MfaPolicy, type SignInExperience } from '@logto/schemas';

export type MfaConfig = SignInExperience['mfa'];
export type SignInPrompt = Exclude<MfaPolicy, MfaPolicy.UserControlled | MfaPolicy.Mandatory>;

export type MfaConfigForm = {
  totpEnabled: boolean;
  webAuthnEnabled: boolean;
  backupCodeEnabled: boolean;
  isMandatory: boolean;
  setUpPrompt: SignInPrompt;
};
