import { experience, ExtraParamsKey } from '@logto/schemas';
import { type MiddlewareType } from 'koa';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const buildOneTimeTokenUrl = (token: string, loginHint: string) => {
  const searchParams = new URLSearchParams({
    [ExtraParamsKey.LoginHint]: loginHint,
    [ExtraParamsKey.OneTimeToken]: token,
  });

  return `${experience.routes.oneTimeToken}?${searchParams.toString()}`;
};

const buildOneTimeTokenErrorUrl = (message: string) => {
  const searchParams = new URLSearchParams({ errorMessage: message });

  return `${experience.routes.oneTimeToken}?${searchParams.toString()}`;
};

const hasLoginPrompt = (prompt: unknown) =>
  typeof prompt === 'string' && prompt.split(' ').includes('login');

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

const shouldContinueWithConsumedOneTimeToken = async ({
  primaryEmail,
  loginHint,
  lastSubmission,
  getPrimaryEmailByUserId,
}: {
  primaryEmail: string;
  loginHint: string;
  lastSubmission: unknown;
  getPrimaryEmailByUserId: (userId: string) => Promise<string>;
}) => {
  if (primaryEmail === loginHint) {
    return true;
  }

  const submittedAccountId = getLastSubmittedLoginAccountId(lastSubmission);

  if (!submittedAccountId) {
    return false;
  }

  try {
    return (await getPrimaryEmailByUserId(submittedAccountId)) === loginHint;
  } catch {
    return false;
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
    const {
      params: { one_time_token: token, login_hint: loginHint, prompt },
      session,
    } = ctx.interactionDetails;

    assertThat(session, new RequestError({ code: 'session.not_found' }));

    // Handle one-time token before auto-consent
    if (token && loginHint && typeof token === 'string' && typeof loginHint === 'string') {
      const getPrimaryEmailByUserId = async (userId: string) => {
        const { primaryEmail } = await queries.users.findUserById(userId);

        assertThat(primaryEmail, 'user.email_not_exist');

        return primaryEmail;
      };
      const primaryEmail = await getPrimaryEmailByUserId(session.accountId);

      try {
        await libraries.oneTimeTokens.checkOneTimeToken(token, loginHint);
      } catch (error: unknown) {
        if (error instanceof RequestError) {
          if (
            error.code === 'one_time_token.token_consumed' &&
            (await shouldContinueWithConsumedOneTimeToken({
              primaryEmail,
              loginHint,
              lastSubmission: ctx.interactionDetails.lastSubmission,
              getPrimaryEmailByUserId,
            }))
          ) {
            return next();
          }
          ctx.redirect(buildOneTimeTokenErrorUrl(error.message));
          return;
        }
        throw error;
      }

      if (primaryEmail !== loginHint && !hasLoginPrompt(prompt)) {
        const searchParams = new URLSearchParams({
          [ExtraParamsKey.LoginHint]: loginHint,
          [ExtraParamsKey.OneTimeToken]: token,
        });
        ctx.redirect(`${experience.routes.switchAccount}?${searchParams.toString()}`);
        return;
      }

      ctx.redirect(buildOneTimeTokenUrl(token, loginHint));
      return;
    }

    return next();
  };
}
