import type { SignUp } from '@logto/schemas';
import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import type { LogtoConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

export const validateSignUp = ({ methods }: SignUp, enabledConnectors: LogtoConnector[]) => {
  if (methods.length === 0) {
    return;
  }

  // Only none, email, sms, username, emailOrSms are supported
  if (methods.length >= 2) {
    assertThat(
      !methods.some(({ identifier }) => identifier === SignInIdentifier.Username),
      new RequestError({
        code: 'sign_in_experiences.sign_up_methods_not_supported',
      })
    );
  }

  for (const method of methods) {
    if (method.identifier === SignInIdentifier.Email) {
      assertThat(
        enabledConnectors.some((item) => item.type === ConnectorType.Email),
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );

      assertThat(
        method.verify,
        new RequestError({
          code: 'sign_in_experiences.passwordless_requires_verify',
        })
      );
    }

    if (method.identifier === SignInIdentifier.Sms) {
      assertThat(
        enabledConnectors.some((item) => item.type === ConnectorType.Sms),
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Sms,
        })
      );

      assertThat(
        method.verify,
        new RequestError({
          code: 'sign_in_experiences.passwordless_requires_verify',
        })
      );
    }

    if (method.identifier === SignInIdentifier.Username) {
      assertThat(
        method.password,
        new RequestError({
          code: 'sign_in_experiences.username_requires_password',
        })
      );
    }
  }
};
