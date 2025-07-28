import { ConnectorType, SignInIdentifier, MfaFactor, MfaPolicy } from '@logto/schemas';

import {
  mockAliyunDmConnector,
  mockAliyunSmsConnector,
  mockSignInMethod,
  mockSignUp,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import { validateSignIn } from './sign-in.js';

const enabledConnectors = [mockAliyunDmConnector, mockAliyunSmsConnector];

describe('validate sign-in', () => {
  describe('pass on valid cases', () => {
    test('email or phone sign up', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Email,
                verificationCode: true,
              },
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Phone,
                verificationCode: true,
              },
            ],
          },
          {
            ...mockSignUp,
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
            password: false,
            verify: true,
          },
          enabledConnectors
        );
      }).not.toThrow();
    });

    test('username sign up', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Username,
                password: true,
              },
            ],
          },
          {
            ...mockSignUp,
            identifiers: [SignInIdentifier.Username],
            password: true,
          },
          []
        );
      }).not.toThrow();
    });
  });

  describe('There must be at least one connector for the specific identifier.', () => {
    it('throws when there is no email connector and identifiers includes email with verification code checked', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Email,
                verificationCode: true,
              },
            ],
          },
          mockSignUp,
          []
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });

    it('throws when there is no sms connector and identifiers includes phone with verification code checked', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Phone,
                verificationCode: true,
              },
            ],
          },
          mockSignUp,
          []
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Sms,
        })
      );
    });
  });

  it('throws when sign up only requires verify and sign in verification code is not enabled', () => {
    expect(() => {
      validateSignIn(
        {
          methods: [
            {
              ...mockSignInMethod,
              identifier: SignInIdentifier.Email,
              verificationCode: false,
            },
          ],
        },
        {
          ...mockSignUp,
          identifiers: [SignInIdentifier.Email],
          password: false,
          verify: true,
        },
        enabledConnectors
      );
    }).toMatchError(
      new RequestError({
        code: 'sign_in_experiences.code_sign_in_must_be_enabled',
      })
    );
  });

  it('throws when verification code and password are both disabled', () => {
    expect(() => {
      validateSignIn(
        {
          methods: [
            {
              ...mockSignInMethod,
              identifier: SignInIdentifier.Email,
              verificationCode: false,
              password: false,
            },
            {
              ...mockSignInMethod,
              identifier: SignInIdentifier.Phone,
              verificationCode: true,
              password: false,
            },
          ],
        },
        {
          ...mockSignUp,
          identifiers: [SignInIdentifier.Phone],
          password: false,
          verify: true,
        },
        enabledConnectors
      );
    }).toMatchError(
      new RequestError({
        code: 'sign_in_experiences.at_least_one_authentication_factor',
      })
    );
  });

  describe('MFA conflicts', () => {
    test('should throw when email verification code is used for both sign-in and MFA', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Email,
                verificationCode: true,
                password: false,
              },
            ],
          },
          mockSignUp,
          enabledConnectors,
          {
            policy: MfaPolicy.Mandatory,
            factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
          }
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.email_verification_code_cannot_be_used_for_sign_in',
        })
      );
    });

    test('should throw when phone verification code is used for both sign-in and MFA', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Phone,
                verificationCode: true,
                password: false,
              },
            ],
          },
          mockSignUp,
          enabledConnectors,
          {
            policy: MfaPolicy.Mandatory,
            factors: [MfaFactor.PhoneVerificationCode, MfaFactor.BackupCode],
          }
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.phone_verification_code_cannot_be_used_for_sign_in',
        })
      );
    });

    test('should pass when email is used with password and MFA uses email verification code', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Email,
                verificationCode: false,
                password: true,
              },
            ],
          },
          mockSignUp,
          enabledConnectors,
          {
            policy: MfaPolicy.Mandatory,
            factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
          }
        );
      }).not.toThrow();
    });

    test('should pass when phone is used with password and MFA uses phone verification code', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Phone,
                verificationCode: false,
                password: true,
              },
            ],
          },
          mockSignUp,
          enabledConnectors,
          {
            policy: MfaPolicy.Mandatory,
            factors: [MfaFactor.PhoneVerificationCode, MfaFactor.TOTP],
          }
        );
      }).not.toThrow();
    });
  });
});
