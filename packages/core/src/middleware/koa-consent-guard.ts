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

/**
 * The primary email of a user, if any. An account without an email, e.g. a username-only one, is
 * simply another account than the one a token is for, and gets the switch-account page rather than
 * an error.
 */
const findPrimaryEmail = async (queries: Queries, userId: string) => {
  const { primaryEmail } = await queries.users.findUserById(userId);

  return primaryEmail ?? undefined;
};

/** Emails are matched case-insensitively, as users are looked up by them. */
const isSameEmail = (email: string | undefined, loginHint: string) =>
  email?.toLowerCase() === loginHint.toLowerCase();

const doesLastSubmittedLoginMatchLoginHint = async ({
  loginHint,
  lastSubmission,
  queries,
}: {
  loginHint: string;
  lastSubmission: unknown;
  queries: Queries;
}) => {
  const submittedAccountId = getLastSubmittedLoginAccountId(lastSubmission);

  if (!submittedAccountId) {
    return false;
  }

  try {
    return isSameEmail(await findPrimaryEmail(queries, submittedAccountId), loginHint);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return false;
    }

    throw error;
  }
};

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
    const isSessionForLoginHint = isSameEmail(
      await findPrimaryEmail(queries, session.accountId),
      loginHint
    );
    const hasMatchingLastSubmittedLogin = await doesLastSubmittedLoginMatchLoginHint({
      loginHint,
      lastSubmission: ctx.interactionDetails.lastSubmission,
      queries,
    });

    if (!isSessionForLoginHint && !hasLoginPrompt(prompt) && !hasMatchingLastSubmittedLogin) {
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
          (isSessionForLoginHint || hasMatchingLastSubmittedLogin)
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
