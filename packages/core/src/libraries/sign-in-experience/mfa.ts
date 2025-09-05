import { MfaFactor, SignInIdentifier, type Mfa, type SignIn } from '@logto/schemas';

import assertThat from '#src/utils/assert-that.js';

export const validateMfa = (mfa: Mfa, signIn?: SignIn) => {
  assertThat(
    new Set(mfa.factors).size === mfa.factors.length,
    'sign_in_experiences.duplicated_mfa_factors'
  );

  const backupCodeEnabled = mfa.factors.includes(MfaFactor.BackupCode);

  if (backupCodeEnabled) {
    assertThat(mfa.factors.length > 1, 'sign_in_experiences.backup_code_cannot_be_enabled_alone');
  }

  // Validate that email/phone verification codes are not used as both sign-in method and MFA
  if (signIn && mfa.factors.includes(MfaFactor.EmailVerificationCode)) {
    const isEmailVerificationCodeSignIn = signIn.methods.some(
      (method) => method.identifier === SignInIdentifier.Email && method.verificationCode
    );
    assertThat(
      !isEmailVerificationCodeSignIn,
      'sign_in_experiences.email_verification_code_cannot_be_used_for_mfa'
    );
  }

  if (signIn && mfa.factors.includes(MfaFactor.PhoneVerificationCode)) {
    const isPhoneVerificationCodeSignIn = signIn.methods.some(
      (method) => method.identifier === SignInIdentifier.Phone && method.verificationCode
    );
    assertThat(
      !isPhoneVerificationCodeSignIn,
      'sign_in_experiences.phone_verification_code_cannot_be_used_for_mfa'
    );
  }
};
