import { logtoConfigGuards, LogtoTenantConfigKey } from '@logto/schemas';
import { appendPath, trySafe } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import type Provider from 'oidc-provider';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { getTenantId } from '#src/utils/tenant.js';

// Need To Align With UI
export const sessionNotFoundPath = '/unknown-session';

export const guardedPath = [
  '/sign-in',
  '/consent',
  '/register',
  '/single-sign-on',
  '/social/register',
  '/forgot-password',
];

export default function koaSpaSessionGuard<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT,
>(provider: Provider, queries: Queries): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;
    const isPreview = ctx.request.URL.searchParams.get('preview');

    const isSessionRequiredPath =
      requestPath === '/' || guardedPath.some((path) => requestPath.startsWith(path));

    if (isSessionRequiredPath && !isPreview) {
      try {
        await provider.interactionDetails(ctx.req, ctx.res);
      } catch {
        const {
          rows: [data],
        } = await queries.logtoConfigs.getRowsByKeys([
          LogtoTenantConfigKey.SessionNotFoundRedirectUrl,
        ]);
        const parsed = trySafe(() =>
          logtoConfigGuards.sessionNotFoundRedirectUrl.parse(data?.value)
        );

        if (parsed?.url) {
          ctx.redirect(parsed.url);

          return;
        }

        const [tenantId] = await getTenantId(ctx.URL);

        if (!tenantId) {
          throw new RequestError({ code: 'session.not_found', status: 404 });
        }

        const tenantEndpoint = getTenantEndpoint(tenantId, EnvSet.values);

        if (EnvSet.values.isDomainBasedMultiTenancy) {
          // Replace to current hostname (if custom domain is used)
          // eslint-disable-next-line @silverhand/fp/no-mutation
          tenantEndpoint.hostname = ctx.request.hostname;
        }

        ctx.redirect(appendPath(tenantEndpoint, sessionNotFoundPath).href);

        return;
      }
    }

    return next();
  };
}
