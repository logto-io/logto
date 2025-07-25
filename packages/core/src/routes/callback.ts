/**
 * @fileoverview This file configures routes to handle callbacks via form submission
 * (POST request) from authentication providers, including cross-origin external requests.
 */

import { UrlSet } from '@logto/shared';
import { yes } from '@silverhand/essentials';
import type Koa from 'koa';
import { koaBody } from 'koa-body';
import Router from 'koa-router';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaCors from '#src/middleware/koa-cors.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * Create UrlSet instances for external cross-origin domains
 * These domains are allowed to make cross-origin requests to the callback endpoint
 */
function createExternalOriginUrlSets(): UrlSet[] {
  const { isDevFeaturesEnabled } = EnvSet.values;
  const urlSets: UrlSet[] = [];

  // Production domains - always allowed
  // Note: UrlSet constructor requires (isHttpsEnabled, defaultPort, envPrefix)
  // For external domains, we create custom UrlSet instances that override environment detection
  class ExternalUrlSet extends UrlSet {
    private readonly customOrigins: string[];

    constructor(origins: string[]) {
      super(true, 443, ''); // HTTPS enabled, port 443, no env prefix
      this.customOrigins = origins;
    }

    deduplicated(): URL[] {
      return this.customOrigins.map((origin) => new URL(origin)).filter(Boolean);
    }
  }

  // Production Logto domains
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  urlSets.push(new ExternalUrlSet(['https://cloud.logto.io']));

  // Development domains (only when dev features enabled)
  if (isDevFeaturesEnabled) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    urlSets.push(new ExternalUrlSet(['https://cloud.logto.dev', 'https://*.logto-docs.pages.dev']));
  }

  return urlSets;
}

function callbackRoutes<T extends Router>(router: T) {
  // Handle OPTIONS preflight requests
  router.options('/callback/:connectorId', async (ctx) => {
    ctx.status = 204;
  });

  router.post(
    '/callback/:connectorId',
    koaBody({
      // Support both form data and JSON requests
      multipart: true,
      urlencoded: true,
      json: true,
      text: false,
    }),
    async (ctx) => {
      // Handle both form data and JSON API requests
      const contentType = ctx.request.header['content-type'] ?? '';

      const parsed = z.record(z.string()).safeParse(ctx.request.body);
      assertThat(parsed.success, new RequestError('oidc.invalid_request'));

      const { query } = ctx.request;
      const isExternal =
        'isExternal' in query &&
        yes(Array.isArray(query.isExternal) ? query.isExternal[0] : query.isExternal);

      if (isExternal) {
        const { adminUrlSet, cloudUrlSet } = EnvSet.values;
        const consoleOrigin = cloudUrlSet
          .deduplicated()
          .find((url) => !url.origin.includes('localhost'))?.origin;

        // For external API requests, respond with JSON instead of redirect
        if (contentType.includes('application/json')) {
          ctx.status = 200;
          ctx.body = {
            success: true,
            redirectUrl: consoleOrigin
              ? `${consoleOrigin}/external-google-one-tap?${new URLSearchParams(parsed.data).toString()}`
              : null,
            adminUrlSet: adminUrlSet.deduplicated(),
            cloudUrlSet: cloudUrlSet.deduplicated(),
          };
          return;
        }

        if (consoleOrigin) {
          ctx.status = 303;
          ctx.set(
            'Location',
            `${consoleOrigin}/external-google-one-tap?${new URLSearchParams(parsed.data).toString()}`
          );
          return;
        }
      }

      // Standard callback behavior - redirect to same path with query parameters
      ctx.status = 303;
      ctx.set('Location', ctx.request.path + '?' + new URLSearchParams(parsed.data).toString());
    }
  );
}

export const mountCallbackRouter = (app: Koa) => {
  const router = new Router();
  router.use(koaCors(createExternalOriginUrlSets(), ['/callback']));
  callbackRoutes(router);

  app.use(router.routes()).use(router.allowedMethods());
};
