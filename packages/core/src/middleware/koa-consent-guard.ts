import { Prompt } from '@logto/js';
import { experience, ExtraParamsKey, FirstScreen } from '@logto/schemas';
import { NotFoundError } from '@silverhand/slonik';
import { type MiddlewareType } from 'koa';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const buildExperienceUrl = (route: string, token: string, loginHint?: string) => {
  const searchParams = new URLSearchParams();

  if (loginHint) {
    searchParams.append(ExtraParamsKey.LoginHint, loginHint);
  }

  searchParams.append(ExtraParamsKey.OneTimeToken, token);

  return `${route}?${searchParams.toString()}`;
};

const buildOneTimeTokenErrorUrl = (message: string) => {
  const searchParams = new URLSearchParams({ errorMessage: message });

  return `${experience.routes.oneTimeToken}?${searchParams.toString()}`;
};

const hasLoginPrompt = (prompt: unknown) =>
  typeof prompt === 'string' && prompt.split(' ').includes(Prompt.Login);

const nonEmptyStringGuard = z.string().min(1);
const optionalNonEmptyStringGuard = z.preprocess(
  (value) => (value === '' ? undefined : value),
  nonEmptyStringGuard.optional()
);

const oneTimeTokenParamsGuard = z.object({
  one_time_token: nonEmptyStringGuard,
  login_hint: nonEmptyStringGuard,
  prompt: z.unknown().optional(),
});

const getOneTimeTokenParams = (params: unknown) => {
  const result = oneTimeTokenParamsGuard.safeParse(params);

  if (!result.success) {
    return;
  }

  const { one_time_token: token, login_hint: loginHint, prompt } = result.data;

  return { token, loginHint, prompt };
};

const resetPasswordOneTimeTokenParamsGuard = z.object({
  first_screen: z.literal(FirstScreen.ResetPassword),
  one_time_token: nonEmptyStringGuard,
  login_hint: optionalNonEmptyStringGuard,
});

const getResetPasswordOneTimeTokenParams = (params: unknown) => {
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  const result = resetPasswordOneTimeTokenParamsGuard.safeParse(params);

  if (!result.success) {
    return;
  }

  const { one_time_token: token, login_hint: loginHint } = result.data;

  return { token, loginHint };
};

const lastSubmittedLoginGuard = z.object({
  login: z.object({
    accountId: z.string(),
  }),
});

const getLastSubmittedLoginAccountId = (lastSubmission: unknown) => {
  const result = lastSubmittedLoginGuard.safeParse(lastSubmission);

  if (!result.success) {
    return;
  }

  return result.data.login.accountId;
};

const isUserNotFoundOrEmailMissingError = (error: unknown) =>
  error instanceof NotFoundError ||
  (error instanceof RequestError && error.code === 'user.email_not_exist');

const doesLastSubmittedLoginMatchLoginHint = async ({
  loginHint,
  lastSubmission,
  getPrimaryEmailByUserId,
}: {
  loginHint: string;
  lastSubmission: unknown;
  getPrimaryEmailByUserId: (userId: string) => Promise<string>;
}) => {
  const submittedAccountId = getLastSubmittedLoginAccountId(lastSubmission);

  if (!submittedAccountId) {
    return false;
  }

  try {
    return (await getPrimaryEmailByUserId(submittedAccountId)) === loginHint;
  } catch (error: unknown) {
    if (isUserNotFoundOrEmailMissingError(error)) {
      return false;
    }

    throw error;
  }
};

const shouldContinueWithConsumedOneTimeToken = ({
  primaryEmail,
  loginHint,
  hasMatchingLastSubmittedLogin,
}: {
  primaryEmail: string;
  loginHint: string;
  hasMatchingLastSubmittedLogin: boolean;
}) => primaryEmail === loginHint || hasMatchingLastSubmittedLogin;

/**
 * Guard before allowing auto-consent.
 * E.g. Check if the active session matches the upcoming one-time token auth request.
 */
export default function koaConsentGuard<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseBodyT,
>(libraries: Libraries, queries: Queries): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const { params, session } = ctx.interactionDetails;

    assertThat(session, new RequestError({ code: 'session.not_found' }));

    const oneTimeTokenParams = getOneTimeTokenParams(params);
    const resetPasswordOneTimeTokenParams = getResetPasswordOneTimeTokenParams(params);

    if (resetPasswordOneTimeTokenParams) {
      const { token, loginHint } = resetPasswordOneTimeTokenParams;

      ctx.redirect(buildExperienceUrl(experience.routes.resetPassword, token, loginHint));
      return;
    }

    if (!oneTimeTokenParams) {
      return next();
    }

    const { token: signInOneTimeToken, loginHint, prompt } = oneTimeTokenParams;
    const getPrimaryEmailByUserId = async (userId: string) => {
      const { primaryEmail } = await queries.users.findUserById(userId);

      assertThat(primaryEmail, 'user.email_not_exist');

      return primaryEmail;
    };
    const primaryEmail = await getPrimaryEmailByUserId(session.accountId);
    const hasMatchingLastSubmittedLogin = await doesLastSubmittedLoginMatchLoginHint({
      loginHint,
      lastSubmission: ctx.interactionDetails.lastSubmission,
      getPrimaryEmailByUserId,
    });

    if (primaryEmail !== loginHint && !hasLoginPrompt(prompt) && !hasMatchingLastSubmittedLogin) {
      ctx.redirect(
        buildExperienceUrl(experience.routes.switchAccount, signInOneTimeToken, loginHint)
      );
      return;
    }

    try {
      await libraries.oneTimeTokens.checkOneTimeToken(signInOneTimeToken, loginHint);
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        if (
          error.code === 'one_time_token.token_consumed' &&
          shouldContinueWithConsumedOneTimeToken({
            primaryEmail,
            loginHint,
            hasMatchingLastSubmittedLogin,
          })
        ) {
          return next();
        }
        ctx.redirect(buildOneTimeTokenErrorUrl(error.message));
        return;
      }
      throw error;
    }

    ctx.redirect(buildExperienceUrl(experience.routes.oneTimeToken, signInOneTimeToken, loginHint));
  };
}
