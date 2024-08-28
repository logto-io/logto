import { isBuiltInLanguageTag } from '@logto/phrases-experience';
import { adminTenantId, guardFullSignInExperience } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import detectLanguage from '#src/i18n/detect-language.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

export default function wellKnownRoutes<T extends AnonymousRouter>(
  ...[router, { libraries, queries, id: tenantId }]: RouterInitArgs<T>
) {
  const {
    signInExperiences: { getFullSignInExperience },
    phrases: { getPhrases },
  } = libraries;
  const {
    customPhrases: { findAllCustomLanguageTags },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  if (tenantId === adminTenantId) {
    router.get(
      '/.well-known/endpoints/:tenantId',
      koaGuard({
        params: z.object({ tenantId: z.string().min(1) }),
        response: z.object({ user: z.string().url() }),
        status: 200,
      }),
      async (ctx, next) => {
        ctx.body = {
          user: getTenantEndpoint(ctx.guard.params.tenantId, EnvSet.values).toString(),
        };

        return next();
      }
    );
  }

  router.get(
    '/.well-known/sign-in-exp',
    koaGuard({ response: guardFullSignInExperience, status: 200 }),
    async (ctx, next) => {
      ctx.body = await getFullSignInExperience(ctx.locale);

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
      const {
        query: { lng },
      } = ctx.guard;

      const {
        languageInfo: { autoDetect, fallbackLanguage },
      } = await findDefaultSignInExperience();

      const acceptableLanguages = conditionalArray<string | string[]>(
        lng,
        autoDetect && detectLanguage(ctx),
        fallbackLanguage
      );
      const customLanguages = await findAllCustomLanguageTags();
      const language =
        acceptableLanguages.find(
          (tag) => isBuiltInLanguageTag(tag) || customLanguages.includes(tag)
        ) ?? 'en';

      ctx.set('Content-Language', language);
      ctx.body = await getPhrases(language);

      return next();
    }
  );
}
