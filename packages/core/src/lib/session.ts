import { conditional } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { Context } from 'koa';
import { InteractionResults, Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { findUserById, updateUserById } from '@/queries/user';
import { maskUserInfo } from '@/utils/format';

export const assignInteractionResults = async (
  ctx: Context,
  provider: Provider,
  result: InteractionResults,
  merge = false
) => {
  // The "mergeWithLastSubmission" will only merge current request's interfaction results,
  // which is stored in ctx.oidc, we need to merge interaction results in two requests,
  // have to do it manually
  // refer to: https://github.com/panva/node-oidc-provider/blob/c243bf6b6663c41ff3e75c09b95fb978eba87381/lib/actions/authorization/interactions.js#L106
  const details = merge ? await provider.interactionDetails(ctx.req, ctx.res) : undefined;
  const ts = dayjs().unix();
  const mergedResult = {
    // Merge with current result
    ...details?.result,
    ...result,
  };

  const redirectTo = await provider.interactionResult(
    ctx.req,
    ctx.res,
    {
      ...mergedResult,
      login: mergedResult.login
        ? {
            ...mergedResult.login,
            // Update ts(timestamp) if the accountId is been set in result
            ts: result.login?.accountId ? ts : mergedResult.login.ts,
          }
        : undefined,
    },
    {
      mergeWithLastSubmission: merge,
    }
  );
  ctx.body = { redirectTo, ts };
};

export const checkProtectedAccess = async (
  ctx: Context,
  provider: Provider,
  lifetime = 10 * 60
) => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  if (!result?.login?.accountId) {
    throw new RequestError('auth.unauthorized');
  }

  if (!result.login.ts || result.login.ts < dayjs().unix() - lifetime) {
    const user = await findUserById(result.login.accountId);

    throw new RequestError('auth.require_re_authentication', {
      username: conditional(
        user.username && maskUserInfo({ type: 'username', value: user.username })
      ),
      phone: conditional(
        user.primaryPhone && maskUserInfo({ type: 'phone', value: user.primaryPhone })
      ),
      email: conditional(
        user.primaryEmail && maskUserInfo({ type: 'email', value: user.primaryEmail })
      ),
    });
  }
};

export const saveUserFirstConsentedAppId = async (userId: string, applicationId: string) => {
  const { applicationId: firstConsentedAppId } = await findUserById(userId);

  if (!firstConsentedAppId) {
    // Save application id that the user first consented
    await updateUserById(userId, { applicationId });
  }
};
