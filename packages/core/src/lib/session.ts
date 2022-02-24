import { Context } from 'koa';
import { InteractionResults, Provider } from 'oidc-provider';

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
