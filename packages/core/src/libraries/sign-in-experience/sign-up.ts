import type { SignUp } from '@logto/schemas';
import { SignInIdentifier, ConnectorType } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

export const validateSignUp = (signUp: SignUp, enabledConnectors: LogtoConnector[]) => {
  for (const identifier of signUp.identifiers) {
    if (identifier === SignInIdentifier.Email) {
      assertThat(
        enabledConnectors.some((item) => item.type === ConnectorType.Email),
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Email,
        })
      );
    }

    if (identifier === SignInIdentifier.Phone) {
      assertThat(
        enabledConnectors.some((item) => item.type === ConnectorType.Sms),
        new RequestError({
          code: 'sign_in_experiences.enabled_connector_not_found',
          type: ConnectorType.Sms,
        })
      );
    }

    if (identifier === SignInIdentifier.Username) {
      assertThat(
        signUp.password,
        new RequestError({
          code: 'sign_in_experiences.username_requires_password',
        })
      );
    }

    if (identifier === SignInIdentifier.Email || identifier === SignInIdentifier.Phone) {
      assertThat(
        signUp.verify,
        new RequestError({
          code: 'sign_in_experiences.passwordless_requires_verify',
        })
      );
    }
  }
};
