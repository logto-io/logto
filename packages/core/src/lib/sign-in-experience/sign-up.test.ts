import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import { mockAliyunDmConnector, mockAliyunSmsConnector } from '@/__mocks__';
import RequestError from '@/errors/RequestError';

import { validateSignUp } from './sign-up';

const enabledConnectors = [mockAliyunDmConnector, mockAliyunSmsConnector];

describe('validate sign-up', () => {
  describe('There must be at least one enabled connector for the specific identifier.', () => {
    test('should throw when there is no enabled email connector and identifier is email', async () => {
      expect(() => {
        validateSignUp(
          {
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password: true,
                verify: true,
              },
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

    test('should throw when there is no enabled email connector and identifier is email or phone', async () => {
      expect(() => {
        validateSignUp(
          {
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password: true,
                verify: true,
              },
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

    test('should throw when there is no enabled sms connector and identifier is phone', async () => {
      expect(() => {
        validateSignUp(
          {
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password: false,
                verify: true,
              },
              {
                identifier: SignInIdentifier.Sms,
                password: false,
                verify: true,
              },
            ],
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

    test('should throw when there is no enabled email connector and identifier is email or phone', async () => {
      expect(() => {
        validateSignUp(
          {
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password: false,
                verify: true,
              },
              {
                identifier: SignInIdentifier.Sms,
                password: false,
                verify: true,
              },
            ],
          },
          [mockAliyunDmConnector]
        );
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Sms,
        })
      );
    });
  });

  test('should throw when identifier is username and password is false', async () => {
    expect(() => {
      validateSignUp(
        {
          methods: [
            {
              identifier: SignInIdentifier.Username,
              password: false,
              verify: false,
            },
          ],
        },
        enabledConnectors
      );
    }).toMatchError(
      new RequestError({
        code: 'sign_in_experiences.username_requires_password',
      })
    );
  });

  describe('verify should be true for passwordless identifier', () => {
    test('should throw when identifier is email', async () => {
      expect(() => {
        validateSignUp(
          {
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password: true,
                verify: false,
              },
            ],
          },
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
          {
            methods: [
              {
                identifier: SignInIdentifier.Sms,
                password: true,
                verify: false,
              },
            ],
          },
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
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password: false,
                verify: false,
              },
              {
                identifier: SignInIdentifier.Sms,
                password: false,
                verify: false,
              },
            ],
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
