import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorType } from '@logto/connector-kit';
import { isBuiltInLanguageTag } from '@logto/phrases-ui';
import { adminTenantId } from '@logto/schemas';
import { object, string } from 'zod';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import detectLanguage from '#src/i18n/detect-language.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

export default function wellKnownRoutes<T extends AnonymousRouter>(
  ...[router, { queries, libraries, id }]: RouterInitArgs<T>
) {
  const {
    customPhrases: { findAllCustomLanguageTags },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;
  const {
    signInExperiences: { getSignInExperience },
    connectors: { getLogtoConnectors },
    phrases: { getPhrases },
  } = libraries;

  if (id === adminTenantId) {
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

  router.get('/.well-known/sign-in-exp', async (ctx, next) => {
    const [signInExperience, logtoConnectors] = await Promise.all([
      getSignInExperience(),
      getLogtoConnectors(),
    ]);

    const forgotPassword = {
      phone: logtoConnectors.some(({ type }) => type === ConnectorType.Sms),
      email: logtoConnectors.some(({ type }) => type === ConnectorType.Email),
    };

    const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
      Array<ConnectorMetadata & { id: string }>
    >((previous, connectorTarget) => {
      const connectors = logtoConnectors.filter(
        ({ metadata: { target } }) => target === connectorTarget
      );

      return [
        ...previous,
        ...connectors.map(({ metadata, dbEntry: { id } }) => ({ ...metadata, id })),
      ];
    }, []);

    ctx.body = {
      ...signInExperience,
      socialConnectors,
      forgotPassword,
    };

    return next();
  });

  router.get(
    '/.well-known/phrases',
    koaGuard({
      query: object({
        lng: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const {
        query: { lng },
      } = ctx.guard;

      const {
        languageInfo: { autoDetect, fallbackLanguage },
      } = await findDefaultSignInExperience();

      const targetLanguage = lng ? [lng] : [];
      const detectedLanguages = autoDetect ? detectLanguage(ctx) : [];
      const acceptableLanguages = [...targetLanguage, ...detectedLanguages, fallbackLanguage];
      const customLanguages = await findAllCustomLanguageTags();
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
