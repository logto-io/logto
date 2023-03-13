import { appendPath } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import type Provider from 'oidc-provider';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getTenantId } from '#src/utils/tenant.js';

// Need To Align With UI
export const sessionNotFoundPath = '/unknown-session';
export const guardedPath = [
  '/sign-in',
  '/register',
  '/social/register',
  '/reset-password',
  '/forgot-password',
];

export default function koaSpaSessionGuard<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;
    const isPreview = ctx.URL.searchParams.get('preview');
    const isSessionRequiredPath = guardedPath.some((path) => requestPath.startsWith(path));

    if (isSessionRequiredPath && !isPreview) {
      try {
        await provider.interactionDetails(ctx.req, ctx.res);
      } catch {
        const tenantId = getTenantId(ctx.URL);

        if (!tenantId) {
          throw new RequestError({ code: 'session.not_found', status: 404 });
        }

        ctx.redirect(
          appendPath(getTenantEndpoint(tenantId, EnvSet.values), sessionNotFoundPath).href
        );

        return;
      }
    }

    return next();
  };
}
