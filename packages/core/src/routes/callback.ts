/**
 * @fileoverview This file is used to configure routes handle the callback via form submission
 * (POST request) from the authentication provider.
 */

import { accountCenterSocialStatePrefix } from '@logto/schemas';
import { tryThat } from '@silverhand/essentials';
import type Koa from 'koa';
import { koaBody } from 'koa-body';
import Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { parseWithIssueCap } from '#src/middleware/koa-guard.js';

const getAccountCenterCallbackLocation = (connectorId: string | undefined, searchParams: string) =>
  `/account/callback/social/${connectorId ?? ''}?${searchParams}`;

const parseCallbackBody = (body: unknown) =>
  tryThat(
    () => parseWithIssueCap(z.record(z.string()), body),
    new RequestError('oidc.invalid_request')
  );

function callbackRoutes<T extends Router>(router: T) {
  /**
   * Sign-in Experience and Account Center share the same social callback URI, so that connectors
   * allowing only one redirect URI (e.g. QQ) can serve both. Route by the `state` prefix, and
   * default to the Sign-in Experience for any other `state`, which covers in-flight requests and
   * custom sign-in UIs building their own `state`.
   */
  router.get('/callback/:connectorId', async (ctx, next) => {
    const searchParams = new URLSearchParams(ctx.querystring).toString();
    const state = typeof ctx.query.state === 'string' ? ctx.query.state : undefined;

    if (state?.startsWith(accountCenterSocialStatePrefix)) {
      ctx.status = 303;
      ctx.set('Location', getAccountCenterCallbackLocation(ctx.params.connectorId, searchParams));
      return;
    }

    await next();
  });
  router.post('/callback/:connectorId', koaBody(), async (ctx) => {
    const data = parseCallbackBody(ctx.request.body);
    const searchParams = new URLSearchParams(data).toString();
    const { state } = data;

    ctx.status = 303;
    if (state?.startsWith(accountCenterSocialStatePrefix)) {
      ctx.set('Location', getAccountCenterCallbackLocation(ctx.params.connectorId, searchParams));
      return;
    }

    ctx.set('Location', ctx.request.path + '?' + searchParams);
  });
  router.post('/account/callback/social/:connectorId', koaBody(), async (ctx) => {
    const data = parseCallbackBody(ctx.request.body);

    ctx.status = 303;
    ctx.set('Location', ctx.request.path + '?' + new URLSearchParams(data).toString());
  });
}

export const mountCallbackRouter = (app: Koa) => {
  const router = new Router();
  callbackRoutes(router);

  app.use(router.routes());
};
