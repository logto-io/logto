/**
 * @fileoverview This file is used to configure routes handle the callback via form submission
 * (POST request) from the authentication provider.
 */

import type Koa from 'koa';
import { koaBody } from 'koa-body';
import Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

function callbackRoutes<T extends Router>(router: T) {
  router.post('/callback/:connectorId', koaBody(), async (ctx) => {
    const parsed = z.record(z.string()).safeParse(ctx.request.body);

    assertThat(parsed.success, new RequestError('oidc.invalid_request'));

    ctx.status = 303;
    ctx.set('Location', ctx.request.path + '?' + new URLSearchParams(parsed.data).toString());
  });
  router.post('/account/callback/social/:connectorId', koaBody(), async (ctx) => {
    const parsed = z.record(z.string()).safeParse(ctx.request.body);

    assertThat(parsed.success, new RequestError('oidc.invalid_request'));

    ctx.status = 303;
    ctx.set('Location', ctx.request.path + '?' + new URLSearchParams(parsed.data).toString());
  });
}

export const mountCallbackRouter = (app: Koa) => {
  const router = new Router();
  callbackRoutes(router);

  app.use(router.routes());
};
