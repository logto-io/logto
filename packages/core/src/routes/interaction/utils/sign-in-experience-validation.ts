import type { Event, SignInExperience, Profile } from '@logto/schemas';
import { SignInMode, SignInExperienceIdentifier } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import type { IdentifierPayload } from '../types/guard.js';

const forbiddenEventError = new RequestError({ code: 'auth.forbidden', status: 403 });

const forbiddenIdentifierError = new RequestError({
  code: 'user.sign_in_method_not_enabled',
  status: 422,
});

export const signInModeValidation = (event: Event, { signInMode }: SignInExperience) => {
  if (event === 'sign-in') {
    assertThat(signInMode !== SignInMode.Register, forbiddenEventError);
  }

  if (event === 'register') {
    assertThat(signInMode !== SignInMode.SignIn, forbiddenEventError);
  }
};

export const identifierValidation = (
  identifier: IdentifierPayload,
  signInExperience: SignInExperience
) => {
  const { signIn, signUp } = signInExperience;

  // Username Password Identifier
  if ('username' in identifier) {
    assertThat(
      signIn.methods.some(
        ({ identifier: method, password }) =>
          method === SignInExperienceIdentifier.Username && password
      ),
      forbiddenIdentifierError
    );

    return;
  }

  // Email Identifier
  if ('email' in identifier) {
    assertThat(
      // eslint-disable-next-line complexity
      signIn.methods.some(({ identifier: method, password, verificationCode }) => {
        if (method !== SignInExperienceIdentifier.Email) {
          return false;
        }

        // Email Password Verification
        if ('password' in identifier && !password) {
          return false;
        }

        // Email Passcode Verification: SignIn verificationCode enabled or SignUp Email verify enabled
        if (
          'passcode' in identifier &&
          !verificationCode &&
          !signUp.identifiers.includes(SignInExperienceIdentifier.Email) &&
          !signUp.verify
        ) {
          return false;
        }

        return true;
      }),
      forbiddenIdentifierError
    );

    return;
  }

  // Phone Identifier
  if ('phone' in identifier) {
    assertThat(
      // eslint-disable-next-line complexity
      signIn.methods.some(({ identifier: method, password, verificationCode }) => {
        if (method !== SignInExperienceIdentifier.Sms) {
          return false;
        }

        // Phone Password Verification
        if ('password' in identifier && !password) {
          return false;
        }

        // Phone Passcode Verification: SignIn verificationCode enabled or SignUp Email verify enabled
        if (
          'passcode' in identifier &&
          !verificationCode &&
          !signUp.identifiers.includes(SignInExperienceIdentifier.Sms) &&
          !signUp.verify
        ) {
          return false;
        }

        return true;
      }),
      forbiddenIdentifierError
    );
  }

  // Social Identifier  TODO: @darcy, @sijie
};

export const profileValidation = (profile: Profile, { signUp }: SignInExperience) => {
  if (profile.phone) {
    assertThat(
      signUp.identifiers.includes(SignInExperienceIdentifier.Sms),
      forbiddenIdentifierError
    );
  }

  if (profile.email) {
    assertThat(
      signUp.identifiers.includes(SignInExperienceIdentifier.Email),
      forbiddenIdentifierError
    );
  }

  if (profile.username) {
    assertThat(
      signUp.identifiers.includes(SignInExperienceIdentifier.Username),
      forbiddenIdentifierError
    );
  }

  if (profile.password) {
    assertThat(signUp.password, forbiddenIdentifierError);
  }
};
