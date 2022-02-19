import { Context } from 'koa';
import { InteractionResults, Provider } from 'oidc-provider';

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
