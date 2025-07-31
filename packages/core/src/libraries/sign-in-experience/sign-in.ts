import type { SignIn, SignUp, Mfa } from '@logto/schemas';
import { ConnectorType, SignInIdentifier, MfaFactor } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

export const validateSignIn = (
  signIn: SignIn,
  signUp: SignUp,
  enabledConnectors: LogtoConnector[],
  mfa?: Mfa
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
      ({ identifier, verificationCode }) =>
        verificationCode && identifier === SignInIdentifier.Phone
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

  // Validate that email/phone verification codes are not used as both sign-in method and MFA
  if (mfa) {
    const isEmailVerificationCodeSignIn = signIn.methods.some(
      ({ identifier, verificationCode }) =>
        verificationCode && identifier === SignInIdentifier.Email
    );
    if (isEmailVerificationCodeSignIn) {
      assertThat(
        !mfa.factors.includes(MfaFactor.EmailVerificationCode),
        new RequestError({
          code: 'sign_in_experiences.email_verification_code_cannot_be_used_for_sign_in',
        })
      );
    }

    const isPhoneVerificationCodeSignIn = signIn.methods.some(
      ({ identifier, verificationCode }) =>
        verificationCode && identifier === SignInIdentifier.Phone
    );
    if (isPhoneVerificationCodeSignIn) {
      assertThat(
        !mfa.factors.includes(MfaFactor.PhoneVerificationCode),
        new RequestError({
          code: 'sign_in_experiences.phone_verification_code_cannot_be_used_for_sign_in',
        })
      );
    }
  }
};
