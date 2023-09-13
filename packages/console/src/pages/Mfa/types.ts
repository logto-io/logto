import { type MfaPolicy, type SignInExperience } from '@logto/schemas';

export type MfaConfig = SignInExperience['mfa'];

export type MfaConfigForm = {
  policy: MfaPolicy;
  totpEnabled: boolean;
  webAuthnEnabled: boolean;
  backupCodeEnabled: boolean;
};
