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

// Edited from https://stackoverflow.com/a/74743075/12514940
function isStringRecord(object: unknown): object is Record<string, string> {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  if (Array.isArray(object)) {
    return false;
  }

  if (Object.getOwnPropertySymbols(object).length > 0) {
    return false;
  }

  return Object.getOwnPropertyNames(object).every(
    // @ts-expect-error This is a type guard
    (property) => typeof object[property] === 'string'
  );
}

function callbackRoutes<T extends Router>(router: T) {
  router.post('/callback/:connectorId', koaBody(), async (ctx) => {
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
