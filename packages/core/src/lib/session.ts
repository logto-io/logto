import { conditional } from '@silverhand/essentials';
import { getUnixTime } from 'date-fns';
import type { Context } from 'koa';
import type { InteractionResults, Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { findUserById, updateUserById } from '@/queries/user';

export const assignInteractionResults = async (
  ctx: Context,
  provider: Provider,
  result: InteractionResults,
  merge = false
) => {
  // The "mergeWithLastSubmission" will only merge current request's interaction results,
  // which is stored in ctx.oidc, we need to merge interaction results in two requests,
  // have to do it manually
  // refer to: https://github.com/panva/node-oidc-provider/blob/c243bf6b6663c41ff3e75c09b95fb978eba87381/lib/actions/authorization/interactions.js#L106
  const details = merge ? await provider.interactionDetails(ctx.req, ctx.res) : undefined;
  const ts = getUnixTime(new Date());
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
      ...conditional(
        mergedResult.login && {
          login: {
            ...mergedResult.login,
            // Update ts(timestamp) if the accountId has been set in result
            ts: result.login?.accountId ? ts : mergedResult.login.ts,
          },
        }
      ),
    },
    {
      mergeWithLastSubmission: merge,
    }
  );
  ctx.body = { redirectTo, ts };
};

export const checkSessionHealth = async (
  ctx: Context,
  provider: Provider,
  tolerance = 10 * 60 // 10 mins
) => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  if (!result?.login?.accountId) {
    throw new RequestError('auth.unauthorized');
  }

  if (!result.login.ts || result.login.ts < getUnixTime(new Date()) - tolerance) {
    const { passwordEncrypted, primaryPhone, primaryEmail } = await findUserById(
      result.login.accountId
    );

    // No authenticated method configured for this user. Pass!
    if (!passwordEncrypted && !primaryPhone && !primaryEmail) {
      return;
    }
    throw new RequestError('auth.require_re_authentication');
  }
};

export const saveUserFirstConsentedAppId = async (userId: string, applicationId: string) => {
  const { applicationId: firstConsentedAppId } = await findUserById(userId);

  if (!firstConsentedAppId) {
    // Save application id that the user first consented
    await updateUserById(userId, { applicationId });
  }
};
