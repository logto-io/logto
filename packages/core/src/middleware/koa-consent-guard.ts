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

const getOneTimeTokenParams = ({
  one_time_token: token,
  login_hint: loginHint,
  prompt,
}: {
  one_time_token?: unknown;
  login_hint?: unknown;
  prompt?: unknown;
}) => {
  if (!token || !loginHint || typeof token !== 'string' || typeof loginHint !== 'string') {
    return;
  }

  return { token, loginHint, prompt };
};

const getOneTimeToken = ({ one_time_token: token }: { one_time_token?: unknown }) =>
  token && typeof token === 'string' ? token : undefined;

const getLoginHint = ({ login_hint: loginHint }: { login_hint?: unknown }) =>
  loginHint && typeof loginHint === 'string' ? loginHint : undefined;

const isResetPasswordFirstScreen = ({ first_screen: firstScreen }: { first_screen?: unknown }) =>
  firstScreen === FirstScreen.ResetPassword;

const getResetPasswordOneTimeToken = (
  params: Parameters<typeof getOneTimeToken>[0] & Parameters<typeof isResetPasswordFirstScreen>[0]
) => {
  if (!EnvSet.values.isDevFeaturesEnabled || !isResetPasswordFirstScreen(params)) {
    return;
  }

  return getOneTimeToken(params);
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
    const resetPasswordToken = getResetPasswordOneTimeToken(params);

    if (resetPasswordToken) {
      ctx.redirect(
        buildExperienceUrl(
          experience.routes.resetPassword,
          resetPasswordToken,
          getLoginHint(params)
        )
      );
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
