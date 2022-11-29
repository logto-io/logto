import type { SignIn, SignUp } from '@logto/schemas';
import { ConnectorType, SignInExperienceIdentifier } from '@logto/schemas';

import type { LogtoConnector } from '#src/connectors/types.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

/* eslint-disable complexity */
export const validateSignIn = (
  signIn: SignIn,
  signUp: SignUp,
  enabledConnectors: LogtoConnector[]
) => {
  if (
    signIn.methods.some(
      ({ identifier, verificationCode }) =>
        verificationCode && identifier === SignInExperienceIdentifier.Email
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
      ({ identifier, verificationCode }) =>
        verificationCode && identifier === SignInExperienceIdentifier.Sms
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

  if (signUp.identifiers.includes(SignInExperienceIdentifier.Username)) {
    assertThat(
      signIn.methods.some(({ identifier }) => identifier === SignInExperienceIdentifier.Username),
      new RequestError({
        code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
      })
    );
  }

  if (signUp.identifiers.includes(SignInExperienceIdentifier.Email)) {
    assertThat(
      signIn.methods.some(({ identifier }) => identifier === SignInExperienceIdentifier.Email),
      new RequestError({
        code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
      })
    );
  }

  if (signUp.identifiers.includes(SignInExperienceIdentifier.Sms)) {
    assertThat(
      signIn.methods.some(({ identifier }) => identifier === SignInExperienceIdentifier.Sms),
      new RequestError({
        code: 'sign_in_experiences.miss_sign_up_identifier_in_sign_in',
      })
    );
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
          verificationCode || identifier === SignInExperienceIdentifier.Username
      ),
      new RequestError({
        code: 'sign_in_experiences.code_sign_in_must_be_enabled',
      })
    );
  }
};
/* eslint-enable complexity */
