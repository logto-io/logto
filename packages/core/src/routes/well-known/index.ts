import {
  adminTenantId,
  fullSignInExperienceGuard,
  maximumAuthenticationAgeInSecondsGuard,
} from '@logto/schemas';
import { z } from 'zod';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import { getExperienceLanguage } from '#src/utils/i18n.js';

import { getAccountCenterApiGuards } from '../account-center/guards.js';
import type { AnonymousRouter } from '../types.js';

import experienceRoutes from './well-known.experience.js';

export default function wellKnownRoutes<T extends AnonymousRouter>(
  router: T,
  { libraries, queries, id: tenantId }: TenantContext
) {
  const { accountCenter: accountCenterApiGuard } = getAccountCenterApiGuards();
  const {
    signInExperiences: { getFullSignInExperience },
    phrases: { getPhrases },
  } = libraries;
  const {
    customPhrases: { findAllCustomLanguageTags },
    signInExperiences: { findDefaultSignInExperience },
    accountCenters: { findDefaultAccountCenter, getMaximumAuthenticationAgeInSeconds },
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
    koaGuard({
      query: z.object({ organizationId: z.string(), appId: z.string() }).partial(),
      response: fullSignInExperienceGuard,
      status: 200,
    }),
    async (ctx, next) => {
      const { organizationId, appId } = ctx.guard.query;
      ctx.body = await getFullSignInExperience({ locale: ctx.locale, organizationId, appId });

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

      const { languageInfo } = await findDefaultSignInExperience();
      const customLanguages = await findAllCustomLanguageTags();
      const language = getExperienceLanguage({ ctx, languageInfo, customLanguages, lng });

      ctx.set('Content-Language', language);
      ctx.body = await getPhrases(language);

      return next();
    }
  );

  experienceRoutes(router, libraries);

  router.get(
    '/.well-known/account-center',
    koaGuard({
      response: accountCenterApiGuard,
      status: 200,
    }),
    async (ctx, next) => {
      ctx.body = await findDefaultAccountCenter();
      return next();
    }
  );

  // DEV: OIDC step-up authentication. The Account Center reads the freshness window from the
  // tenant's account center setting here so its proactive step-up and the Account API policy agree;
  // it falls back to the default when the feature is off and this route is absent.
  if (EnvSet.values.isDevFeaturesEnabled) {
    const authenticationPolicyGuard = z.object({
      maximumAuthenticationAgeInSeconds: maximumAuthenticationAgeInSecondsGuard,
    });

    router.get(
      '/.well-known/authentication-policy',
      koaGuard({
        response: authenticationPolicyGuard,
        status: 200,
      }),
      async (ctx, next) => {
        ctx.body = {
          maximumAuthenticationAgeInSeconds: await getMaximumAuthenticationAgeInSeconds(),
        };
        return next();
      }
    );
  }
}
