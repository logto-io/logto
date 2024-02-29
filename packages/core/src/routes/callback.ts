/**
 * @fileoverview This file is used to configure routes handle the callback via form submission
 * (POST request) from the authentication provider.
 */

import type Koa from 'koa';
import koaBody from 'koa-body';
import Router from 'koa-router';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

function callbackRoutes<T extends Router>(router: T) {
  router.post('/callback/:connectorId', koaBody(), async (ctx) => {
    assertThat(
      typeof ctx.request.body === 'object' && ctx.request.body !== null,
      new RequestError('oidc.invalid_request')
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ctx.redirect(ctx.request.path + '?' + new URLSearchParams(ctx.request.body).toString());
  });
}

export const mountCallbackRouter = (app: Koa) => {
  const router = new Router();
  callbackRoutes(router);

  app.use(router.routes());
};
