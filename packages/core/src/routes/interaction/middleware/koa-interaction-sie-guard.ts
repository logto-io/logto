import type { SignInExperience } from '@logto/schemas';
import { SignInMode, SignUpIdentifier, SignInIdentifier } from '@logto/schemas';
import type { MiddlewareType, Context } from 'koa';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { getSignInExperienceForApplication } from '#src/lib/sign-in-experience/index.js';
import type { IdentifierPayload } from '#src/routes/interaction/types/index.js';
import assertThat from '#src/utils/assert-that.js';

import type { WithGuardedIdentifierPayloadContext } from './koa-interaction-body-guard.js';

const forbiddenEventError = new RequestError({ code: 'auth.forbidden', status: 403 });

const forbiddenIdentifierError = new RequestError({
  code: 'user.sign_up_method_not_enabled',
  status: 422,
});

/* eslint-disable complexity */
const identifierMethodValidation = (
  { identity, verification }: IdentifierPayload,
  { signIn }: SignInExperience
) => {
  switch (identity.type) {
    case 'username':
      assertThat(
        signIn.methods.some(
          ({ identifier: method, password }) => method === SignInIdentifier.Username && password
        ),
        forbiddenIdentifierError
      );
      break;
    case 'email':
    case 'phone':
      assertThat(
        signIn.methods.some(({ identifier: method, password, verificationCode }) => {
          if (identity.type === 'email' && method !== SignInIdentifier.Email) {
            return false;
          }

          if (identity.type === 'phone' && method !== SignInIdentifier.Sms) {
            return false;
          }

          if (verification.type === 'password' && !password) {
            return false;
          }

          if (verification.type === 'passcode' && !verificationCode) {
            return false;
          }

          return true;
        }),
        forbiddenIdentifierError
      );
      break;
    default:
      break;
  }
};

export default function koaSessionInteractionGuard<
  StateT,
  ContextT extends WithGuardedIdentifierPayloadContext<Context>,
  ResponseBodyT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const interaction = await provider.interactionDetails(ctx.req, ctx.res);

    const signInExperience = await getSignInExperienceForApplication(
      typeof interaction.params.client_id === 'string' ? interaction.params.client_id : undefined
    );

    const { event, identifier, profile } = ctx.identifierPayload;

    // SignInMode validation
    if (event === 'sign-in') {
      assertThat(signInExperience.signInMode !== SignInMode.Register, forbiddenEventError);
    }

    if (event === 'register') {
      assertThat(signInExperience.signInMode !== SignInMode.SignIn, forbiddenEventError);
    }

    // SignIn Identifier validation
    if (identifier) {
      identifierMethodValidation(identifier, signInExperience);
    }

    // SignUp Identifier validation
    if (profile) {
      assertThat(
        !profile.phone ||
          signInExperience.signUp.identifier === SignUpIdentifier.Sms ||
          signInExperience.signUp.identifier === SignUpIdentifier.EmailOrSms,
        forbiddenIdentifierError
      );

      assertThat(
        !profile.email ||
          signInExperience.signUp.identifier === SignUpIdentifier.Email ||
          signInExperience.signUp.identifier === SignUpIdentifier.EmailOrSms,
        forbiddenIdentifierError
      );

      assertThat(
        !profile.username || signInExperience.signUp.identifier === SignUpIdentifier.Username,
        forbiddenIdentifierError
      );

      assertThat(!profile.password || signInExperience.signUp.password, forbiddenIdentifierError);
    }

    return next();
  };
  /* eslint-enable complexity */
}
