import { ConnectorType, SignInIdentifier, SignUpIdentifier } from '@logto/schemas';

import {
  mockAliyunDmConnector,
  mockAliyunSmsConnector,
  mockSignInMethod,
  mockSignUp,
} from '@/__mocks__';
import RequestError from '@/errors/RequestError';

import { validateSignIn } from './sign-in';

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
                identifier: SignInIdentifier.Sms,
                verificationCode: true,
              },
            ],
          },
          {
            ...mockSignUp,
            identifier: SignUpIdentifier.EmailOrSms,
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
            identifier: SignUpIdentifier.Username,
            password: true,
          },
          []
        );
      }).not.toThrow();
    });
  });

  describe('There must be at least one enabled connector for the specific identifier.', () => {
    it('throws when there is no enabled email connector and identifiers includes email with verification code checked', () => {
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

    it('throws when there is no enabled sms connector and identifiers includes phone with verification code checked', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Sms,
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

  describe('The sign up identifier must be included in sign in', () => {
    it('throws when sign up is username and sign in methods does not include username', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Sms,
              },
            ],
          },
          {
            ...mockSignUp,
            identifier: SignUpIdentifier.Username,
          },
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
        })
      );
    });

    it('throws when sign up is email and sign in methods does not include email', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Username,
              },
            ],
          },
          {
            ...mockSignUp,
            identifier: SignUpIdentifier.Email,
          },
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
        })
      );
    });

    it('throws when sign up is phone and sign in methods does not include phone', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Username,
              },
            ],
          },
          {
            ...mockSignUp,
            identifier: SignUpIdentifier.Sms,
          },
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
        })
      );
    });

    it('throws when sign up is `email or phone` and sign in methods does not include email and phone', () => {
      expect(() => {
        validateSignIn(
          {
            methods: [
              {
                ...mockSignInMethod,
                identifier: SignInIdentifier.Email,
              },
            ],
          },
          {
            ...mockSignUp,
            identifier: SignUpIdentifier.EmailOrSms,
          },
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
        })
      );
    });
  });

  it('throws when sign up requires set a password and sign in password is not enabled', () => {
    expect(() => {
      validateSignIn(
        {
          methods: [
            {
              ...mockSignInMethod,
              identifier: SignInIdentifier.Email,
              password: false,
              verificationCode: true,
            },
          ],
        },
        {
          ...mockSignUp,
          identifier: SignUpIdentifier.Email,
          password: true,
        },
        enabledConnectors
      );
    }).toMatchError(
      new RequestError({
        code: 'sign_in_experiences.password_sign_in_must_be_enabled',
      })
    );
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
          identifier: SignUpIdentifier.Email,
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
              identifier: SignInIdentifier.Sms,
              verificationCode: true,
              password: false,
            },
          ],
        },
        {
          ...mockSignUp,
          identifier: SignUpIdentifier.Sms,
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
});
