import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import { mockAliyunDmConnector, mockAliyunSmsConnector, mockSignUp } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import { validateSignUp } from './sign-up.js';

const enabledConnectors = [mockAliyunDmConnector, mockAliyunSmsConnector];

jest.mock('#src/lib/session.js', () => ({
  ...jest.requireActual('#src/lib/session.js'),
  getApplicationIdFromInteraction: jest.fn(),
}));

describe('validate sign-up', () => {
  describe('There must be at least one connector for the specific identifier.', () => {
    test('should throw when there is no email connector and identifier is email', async () => {
      expect(() => {
        validateSignUp({ ...mockSignUp, identifiers: [SignInIdentifier.Email] }, []);
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
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Sms],
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
        validateSignUp({ ...mockSignUp, identifiers: [SignInIdentifier.Sms] }, []);
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
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Sms],
          },
          [mockAliyunSmsConnector]
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
        { ...mockSignUp, identifiers: [SignInIdentifier.Username], password: false },
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
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Sms],
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
