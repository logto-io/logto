import { MfaFactor, type Mfa } from '@logto/schemas';

import assertThat from '#src/utils/assert-that.js';

export const validateMfa = (mfa: Mfa) => {
  assertThat(
    new Set(mfa.factors).size === mfa.factors.length,
    'sign_in_experiences.duplicated_mfa_factors'
  );

  const backupCodeEnabled = mfa.factors.includes(MfaFactor.BackupCode);

  if (backupCodeEnabled) {
    assertThat(mfa.factors.length > 1, 'sign_in_experiences.backup_code_cannot_be_enabled_alone');
  }
};
