import { MfaFactor, MfaPolicy, SignInIdentifier, type Mfa, type SignIn } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { resetDevFeaturesEnabled, setDevFeaturesEnabled } from '#src/test-utils/dev-features.js';

import { validateMfa } from './mfa.js';

describe('validate mfa', () => {
  afterEach(() => {
    resetDevFeaturesEnabled();
  });

  describe('pass on valid cases', () => {
    it('should pass on empty factors', () => {
      expect(() => {
        validateMfa({
          factors: [],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        });
      }).not.toThrow();
    });

    it('should pass on TOTP only', () => {
      expect(() => {
        validateMfa({
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        });
      }).not.toThrow();
    });

    it('should pass on TOTP with backup code', () => {
      expect(() => {
        validateMfa({
          factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        });
      }).not.toThrow();
    });
  });

  it('should throw on backup code alone', () => {
    expect(() => {
      validateMfa({
        factors: [MfaFactor.BackupCode],
        policy: MfaPolicy.PromptAtSignInAndSignUp,
      });
    }).toMatchError(new RequestError('sign_in_experiences.backup_code_cannot_be_enabled_alone'));
  });

  it('should throw on duplicated factors', () => {
    expect(() => {
      validateMfa({
        factors: [MfaFactor.TOTP, MfaFactor.TOTP],
        policy: MfaPolicy.PromptAtSignInAndSignUp,
      });
    }).toMatchError(new RequestError('sign_in_experiences.duplicated_mfa_factors'));
  });

  describe('verification-code sign-in and MFA coexistence', () => {
    const emailCodeSignIn: SignIn = {
      methods: [
        {
          identifier: SignInIdentifier.Email,
          password: false,
          verificationCode: true,
          isPasswordPrimary: false,
        },
      ],
    };
    const phoneCodeSignIn: SignIn = {
      methods: [
        {
          identifier: SignInIdentifier.Phone,
          password: false,
          verificationCode: true,
          isPasswordPrimary: false,
        },
      ],
    };
    const emailMfa: Mfa = {
      factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
      policy: MfaPolicy.Mandatory,
    };
    const phoneMfa: Mfa = {
      factors: [MfaFactor.PhoneVerificationCode, MfaFactor.TOTP],
      policy: MfaPolicy.Mandatory,
    };

    it('should reject email MFA when email verification is used for sign-in with dev features disabled', () => {
      setDevFeaturesEnabled(false);

      expect(() => {
        validateMfa(emailMfa, emailCodeSignIn);
      }).toMatchError(
        new RequestError('sign_in_experiences.email_verification_code_cannot_be_used_for_mfa')
      );
    });

    it('should reject phone MFA when phone verification is used for sign-in with dev features disabled', () => {
      setDevFeaturesEnabled(false);

      expect(() => {
        validateMfa(phoneMfa, phoneCodeSignIn);
      }).toMatchError(
        new RequestError('sign_in_experiences.phone_verification_code_cannot_be_used_for_mfa')
      );
    });

    it('should allow email and phone MFA with the matching sign-in method with dev features enabled', () => {
      setDevFeaturesEnabled(true);

      expect(() => {
        validateMfa(emailMfa, emailCodeSignIn);
        validateMfa(phoneMfa, phoneCodeSignIn);
      }).not.toThrow();
    });
  });
});
