import { Context } from 'koa';
import { InteractionResults, Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { hasUserWithEmail, hasUserWithPhone } from '@/queries/user';
import assertThat from '@/utils/assert-that';

// TODO: change this after frontend is ready.
// Should combine baseUrl(domain) from database with a 'callback' endpoint.
export const connectorRedirectUrl = 'https://logto.dev/callback';

export const assignInteractionResults = async (
  ctx: Context,
  provider: Provider,
  result: InteractionResults,
  merge = false
) => {
  const redirectTo = await provider.interactionResult(ctx.req, ctx.res, result, {
    mergeWithLastSubmission: merge,
  });
  ctx.body = { redirectTo };
};

export const checkEmailValidityAndAvailability = async (email: string) => {
  assertThat(
    !(await hasUserWithEmail(email)),
    new RequestError({ code: 'user.email_exists_register', status: 422 })
  );
};

export const checkEmailValidityAndExistence = async (email: string) => {
  assertThat(
    await hasUserWithEmail(email),
    new RequestError({ code: 'user.email_not_exists', status: 422 })
  );
};

export const checkPhoneNumberValidityAndAvailability = async (phone: string) => {
  assertThat(
    !(await hasUserWithPhone(phone)),
    new RequestError({ code: 'user.phone_exists_register', status: 422 })
  );
};

export const checkPhoneNumberValidityAndExistence = async (phone: string) => {
  assertThat(
    await hasUserWithPhone(phone),
    new RequestError({ code: 'user.phone_not_exists', status: 422 })
  );
};
