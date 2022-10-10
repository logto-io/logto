import { ConnectorType, SignUpIdentifier } from '@logto/schemas';

import { mockAliyunDmConnector, mockAliyunSmsConnector, mockSignUp } from '@/__mocks__';
import RequestError from '@/errors/RequestError';

import { validateSignUp } from './sign-up';

const enabledConnectors = [mockAliyunDmConnector, mockAliyunSmsConnector];

describe('validate sign-up', () => {
  describe('There must be at least one enabled connector for the specific identifier.', () => {
    test('should throw when there is no enabled email connector and identifier is email', async () => {
      expect(() => {
        validateSignUp({ ...mockSignUp, identifier: SignUpIdentifier.Email }, []);
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });

    test('should throw when there is no enabled email connector and identifier is email or phone', async () => {
      expect(() => {
        validateSignUp({ ...mockSignUp, identifier: SignUpIdentifier.EmailOrPhone }, []);
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    });

    test('should throw when there is no enabled sms connector and identifier is phone', async () => {
      expect(() => {
        validateSignUp({ ...mockSignUp, identifier: SignUpIdentifier.Phone }, []);
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Sms,
        })
      );
    });

    test('should throw when there is no enabled email connector and identifier is email or phone', async () => {
      expect(() => {
        validateSignUp({ ...mockSignUp, identifier: SignUpIdentifier.EmailOrPhone }, [
          mockAliyunDmConnector,
        ]);
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
        { ...mockSignUp, identifier: SignUpIdentifier.Username, password: false },
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
          { ...mockSignUp, identifier: SignUpIdentifier.Email, verify: false },
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
          { ...mockSignUp, identifier: SignUpIdentifier.Email, verify: false },
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
          { ...mockSignUp, identifier: SignUpIdentifier.EmailOrPhone, verify: false },
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
