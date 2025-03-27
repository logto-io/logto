import {
  AlternativeSignUpIdentifier,
  ConnectorType,
  SignInIdentifier,
  type SignUp,
} from '@logto/schemas';

import { mockAliyunDmConnector, mockAliyunSmsConnector, mockSignUp } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';

const enabledConnectors = [mockAliyunDmConnector, mockAliyunSmsConnector];

const { validateSignUp } = await import('./sign-up.js');

describe('validate sign-up', () => {
  it('should throw when setting secondary identifiers without primary identifiers', async () => {
    expect(() => {
      validateSignUp(
        {
          ...mockSignUp,
          identifiers: [],
          secondaryIdentifiers: [{ identifier: SignInIdentifier.Email }],
        },
        enabledConnectors
      );
    }).toMatchError(
      new RequestError({
        code: 'sign_in_experiences.missing_sign_up_identifiers',
      })
    );
  });

  describe('Sign up identifiers must be unique.', () => {
    const errorTestCase: Array<Pick<SignUp, 'identifiers' | 'secondaryIdentifiers'>> = [
      { identifiers: [SignInIdentifier.Email, SignInIdentifier.Email] },
      {
        identifiers: [SignInIdentifier.Username],
        secondaryIdentifiers: [{ identifier: SignInIdentifier.Username }],
      },
      {
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
        secondaryIdentifiers: [{ identifier: SignInIdentifier.Phone }],
      },
      {
        identifiers: [SignInIdentifier.Phone],
        secondaryIdentifiers: [{ identifier: AlternativeSignUpIdentifier.EmailOrPhone }],
      },
    ];

    test.each(errorTestCase)(
      'should throw when there are duplicated sign up identifiers',
      async (signUp) => {
        expect(() => {
          validateSignUp({ ...mockSignUp, ...signUp }, enabledConnectors);
        }).toMatchError(
          new RequestError({
            code: 'sign_in_experiences.duplicated_sign_up_identifiers',
          })
        );
      }
    );
  });

  describe('There must be at least one connector for the specific identifier.', () => {
    test('should throw when there is no email connector and identifier is email', async () => {
      expect(() => {
        validateSignUp({ ...mockSignUp, identifiers: [SignInIdentifier.Email], verify: true }, []);
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });

    test('should throw when there is no email connector and identifier is email or phone', async () => {
      expect(() => {
        validateSignUp(
          {
            ...mockSignUp,
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
            verify: true,
          },
          []
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });

    test('should throw when there is no sms connector and identifier is phone', async () => {
      expect(() => {
        validateSignUp({ ...mockSignUp, identifiers: [SignInIdentifier.Phone], verify: true }, []);
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Sms,
        })
      );
    });

    test('should throw when there is no email connector and identifier is email or phone', async () => {
      expect(() => {
        validateSignUp(
          {
            ...mockSignUp,
            verify: true,
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
          },
          [mockAliyunSmsConnector]
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });

    test('should throw when there is no email connector and secondary identifier is email', async () => {
      expect(() => {
        validateSignUp(
          {
            ...mockSignUp,
            verify: true,
            secondaryIdentifiers: [{ identifier: SignInIdentifier.Email, verify: true }],
          },
          []
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });

    test('should throw when there is no sms connector and secondary identifier is phone', async () => {
      expect(() => {
        validateSignUp(
          {
            ...mockSignUp,
            verify: true,
            secondaryIdentifiers: [{ identifier: SignInIdentifier.Phone, verify: true }],
          },
          []
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Sms,
        })
      );
    });

    test('should throw when there is no email connector and secondary identifier is email or phone', async () => {
      expect(() => {
        validateSignUp(
          {
            ...mockSignUp,
            verify: true,
            secondaryIdentifiers: [
              { identifier: AlternativeSignUpIdentifier.EmailOrPhone, verify: true },
            ],
          },
          []
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });
  });

  describe('verify should be true for passwordless identifier', () => {
    test('should throw when identifier is email', async () => {
      expect(() => {
        validateSignUp(
          { ...mockSignUp, identifiers: [SignInIdentifier.Email], verify: false },
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.passwordless_requires_verify',
        })
      );
    });

    test('should throw when identifier is phone', async () => {
      expect(() => {
        validateSignUp(
          { ...mockSignUp, identifiers: [SignInIdentifier.Email], verify: false },
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.passwordless_requires_verify',
        })
      );
    });

    test('should throw when identifier is email or phone', async () => {
      expect(() => {
        validateSignUp(
          {
            ...mockSignUp,
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
            verify: false,
          },
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.passwordless_requires_verify',
        })
      );
    });

    test.each([
      {
        identifier: SignInIdentifier.Email,
      },
      {
        identifier: SignInIdentifier.Phone,
      },
      {
        identifier: AlternativeSignUpIdentifier.EmailOrPhone,
      },
    ])(
      'should throw when identifier is %p and verify is not true for each identifier',
      async (identifier) => {
        expect(() => {
          validateSignUp(
            {
              ...mockSignUp,
              secondaryIdentifiers: [identifier],
            },
            enabledConnectors
          );
        }).toMatchError(
          new RequestError({
            code: 'sign_in_experiences.passwordless_requires_verify',
          })
        );
      }
    );

    test.each([
      {
        identifier: SignInIdentifier.Email,
        verify: true,
      },
      {
        identifier: SignInIdentifier.Phone,
        verify: true,
      },
      {
        identifier: AlternativeSignUpIdentifier.EmailOrPhone,
        verify: true,
      },
    ])('should throw when identifier is %p and signUp.verify is not true', async (identifier) => {
      expect(() => {
        validateSignUp(
          {
            ...mockSignUp,
            secondaryIdentifiers: [identifier],
            verify: false,
          },
          enabledConnectors
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.passwordless_requires_verify',
        })
      );
    });
  });
});
