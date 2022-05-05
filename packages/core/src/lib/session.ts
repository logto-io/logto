import { Context } from 'koa';
import { InteractionResults, Provider } from 'oidc-provider';

import { findUserById, updateUserById } from '@/queries/user';

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

export const saveUserFirstConsentedAppId = async (userId: string, applicationId: string) => {
  const { applicationId: firstConsentedAppId } = await findUserById(userId);

  if (!firstConsentedAppId) {
    // Save application id that the user first consented
    await updateUserById(userId, { applicationId });
  }
};
