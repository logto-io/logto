import { isBuiltInLanguageTag } from '@logto/phrases-ui';
import { adminTenantId } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import { z } from 'zod';

import { wellKnownCache } from '#src/caches/well-known.js';
import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import detectLanguage from '#src/i18n/detect-language.js';
import { guardFullSignInExperience } from '#src/libraries/sign-in-experience/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { noCache } from '#src/utils/request.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

export default function wellKnownRoutes<T extends AnonymousRouter>(
  ...[router, { libraries, id: tenantId }]: RouterInitArgs<T>
) {
  const {
    signInExperiences: { getSignInExperience, getFullSignInExperience },
    phrases: { getPhrases, getAllCustomLanguageTags },
  } = libraries;

  if (tenantId === adminTenantId) {
    router.get('/.well-known/endpoints/:tenantId', async (ctx, next) => {
      if (!ctx.params.tenantId) {
        throw new RequestError('request.invalid_input');
      }

      ctx.body = {
        user: getTenantEndpoint(ctx.params.tenantId, EnvSet.values),
      };

      return next();
    });
  }

  router.get(
    '/.well-known/sign-in-exp',
    koaGuard({ response: guardFullSignInExperience, status: 200 }),
    async (ctx, next) => {
      if (noCache(ctx.request)) {
        wellKnownCache.invalidate(tenantId, ['sie', 'sie-full']);
        console.log('invalidated');
      }

      ctx.body = await getFullSignInExperience();

      return next();
    }
  );

  router.get(
    '/.well-known/phrases',
    koaGuard({
      query: z.object({
        lng: z.string().optional(),
      }),
      response: z.record(z.string().or(z.record(z.unknown()))),
      status: 200,
    }),
    async (ctx, next) => {
      if (noCache(ctx.request)) {
        wellKnownCache.invalidate(tenantId, ['sie', 'phrases-lng-tags', 'phrases']);
      }

      const {
        query: { lng },
      } = ctx.guard;

      const {
        languageInfo: { autoDetect, fallbackLanguage },
      } = await getSignInExperience();

      const acceptableLanguages = conditionalArray<string | string[]>(
        lng,
        autoDetect && detectLanguage(ctx),
        fallbackLanguage
      );
      const customLanguages = await getAllCustomLanguageTags();
      const language =
        acceptableLanguages.find(
          (tag) => isBuiltInLanguageTag(tag) || customLanguages.includes(tag)
        ) ?? 'en';

      ctx.set('Content-Language', language);
      ctx.body = await getPhrases(language, customLanguages);

      return next();
    }
  );
}
