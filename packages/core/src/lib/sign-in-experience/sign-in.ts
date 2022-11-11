import type { SignIn, SignUp } from '@logto/schemas';
import { ConnectorType, SignInIdentifier, SignUpIdentifier } from '@logto/schemas';

import type { LogtoConnector } from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

/* eslint-disable complexity */
export const validateSignIn = (
  signIn: SignIn,
  signUp: SignUp,
  enabledConnectors: LogtoConnector[]
) => {
  if (
    signIn.methods.some(
      ({ identifier, verificationCode }) =>
        verificationCode && identifier === SignInIdentifier.Email
    )
  ) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Email),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Email,
      })
    );
  }

  if (
    signIn.methods.some(
      ({ identifier, verificationCode }) => verificationCode && identifier === SignInIdentifier.Sms
    )
  ) {
    assertThat(
      enabledConnectors.some((item) => item.type === ConnectorType.Sms),
      new RequestError({
        code: 'sign_in_experiences.enabled_connector_not_found',
        type: ConnectorType.Sms,
      })
    );
  }

  assertThat(
    signIn.methods.every(({ password, verificationCode }) => password || verificationCode),
    new RequestError({
      code: 'sign_in_experiences.at_least_one_authentication_factor',
    })
  );

  switch (signUp.identifier) {
    case SignUpIdentifier.Username: {
      assertThat(
        signIn.methods.some(({ identifier }) => identifier === SignInIdentifier.Username),
        new RequestError({
          code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
        })
      );

      break;
    }

    case SignUpIdentifier.Email: {
      assertThat(
        signIn.methods.some(({ identifier }) => identifier === SignInIdentifier.Email),
        new RequestError({
          code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
        })
      );

      break;
    }

    case SignUpIdentifier.Sms: {
      assertThat(
        signIn.methods.some(({ identifier }) => identifier === SignInIdentifier.Sms),
        new RequestError({
          code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
        })
      );

      break;
    }

    case SignUpIdentifier.EmailOrSms: {
      assertThat(
        signIn.methods.some(({ identifier }) => identifier === SignInIdentifier.Email) &&
          signIn.methods.some(({ identifier }) => identifier === SignInIdentifier.Sms),
        new RequestError({
          code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
        })
      );

      break;
    }

    case SignUpIdentifier.None: {
      // No requirement
    }
    // No default
  }

  if (signUp.password) {
    assertThat(
      signIn.methods.every(({ password }) => password),
      new RequestError({
        code: 'sign_in_experiences.password_sign_in_must_be_enabled',
      })
    );
  }

  if (signUp.verify && !signUp.password) {
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
};
/* eslint-enable complexity */
