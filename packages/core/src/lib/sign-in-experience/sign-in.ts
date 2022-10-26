import type { SignIn, SignUp } from '@logto/schemas';
import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import type { LogtoConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

export const validateSignIn = (
  signIn: SignIn,
  signUp: SignUp,
  enabledConnectors: LogtoConnector[]
) => {
  if (signIn.methods.some(({ identifier }) => identifier === SignInIdentifier.Email)) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Email),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Email,
      })
    );
  }

  if (signIn.methods.some(({ identifier }) => identifier === SignInIdentifier.Sms)) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Sms),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Sms,
      })
    );
  }

  for (const method of signUp.methods) {
    assertThat(
      signIn.methods.some(({ identifier }) => identifier === method.identifier),
      new RequestError({
        code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
      })
    );

    if (method.password) {
      assertThat(
        signIn.methods.every(({ password }) => password),
        new RequestError({
          code: 'sign_in_experiences.password_sign_in_must_be_enabled',
        })
      );
    }

    if (method.verify && !method.password) {
      assertThat(
        signIn.methods.every(
          ({ verificationCode, identifier }) =>
            verificationCode || identifier === SignInIdentifier.Username
        ),
        new RequestError({
          code: 'sign_in_experiences.code_sign_in_must_be_enabled',
        })
      );
    }
  }
};
