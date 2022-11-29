import type { SignUp } from '@logto/schemas';
import { SignInIdentifier, ConnectorType } from '@logto/schemas';

import type { LogtoConnector } from '#src/connectors/types.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

export const validateSignUp = (signUp: SignUp, enabledConnectors: LogtoConnector[]) => {
  if (signUp.identifiers.includes(SignInIdentifier.Email)) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Email),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Email,
      })
    );
  }

  if (signUp.identifiers.includes(SignInIdentifier.Sms)) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Sms),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Sms,
      })
    );
  }

  if (signUp.identifiers.includes(SignInIdentifier.Username)) {
    assertThat(
      signUp.password,
      new RequestError({
        code: 'sign_in_experiences.username_requires_password',
      })
    );
  }

  if (
    signUp.identifiers.includes(SignInIdentifier.Email) ||
    signUp.identifiers.includes(SignInIdentifier.Sms)
  ) {
    assertThat(
      signUp.verify,
      new RequestError({
        code: 'sign_in_experiences.passwordless_requires_verify',
      })
    );
  }
};
