import { MfaFactor } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type MfaConfig, type MfaConfigForm } from '../types';

export const convertMfaConfigToForm = ({ policy, factors }: MfaConfig): MfaConfigForm => ({
  policy,
  totpEnabled: factors.includes(MfaFactor.TOTP),
  webAuthnEnabled: factors.includes(MfaFactor.WebAuthn),
  backupCodeEnabled: factors.includes(MfaFactor.BackupCode),
});

export const convertMfaFormToConfig = (mfaConfigForm: MfaConfigForm): MfaConfig => {
  const { policy, totpEnabled, webAuthnEnabled, backupCodeEnabled } = mfaConfigForm;

  const factors = [
    conditional(totpEnabled && MfaFactor.TOTP),
    conditional(webAuthnEnabled && MfaFactor.WebAuthn),
    conditional(backupCodeEnabled && MfaFactor.BackupCode),
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  ].filter((factor): factor is MfaFactor => Boolean(factor));

  return {
    policy,
    factors,
  };
};

export const validateBackupCodeFactor = (factors: MfaFactor[]): boolean => {
  return !(factors.length === 1 && factors.includes(MfaFactor.BackupCode));
};
