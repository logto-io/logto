import { customDomainsGuard } from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

export default function applicationProtectedAppMetadataRoutes<T extends AuthedRouter>(
  ...[
    router,
    {
      queries: {
        applications: {
          findApplicationById,
          updateApplicationById,
          findApplicationByProtectedAppCustomDomain,
        },
      },
      libraries: {
        applications: { validateProtectedApplicationById },
        protectedApps: { addDomainToRemote, syncAppCustomDomainStatus },
      },
    },
  ]: RouterInitArgs<T>
) {
  const params = Object.freeze({ id: z.string().min(1) } as const);
  const pathname = '/applications/:id/protected-app-metadata';
  const customDomainsPathname = `${pathname}/custom-domains`;

  // Guard application exists and is a protected app
  router.use(pathname, koaGuard({ params: z.object(params) }), async (ctx, next) => {
    const { id } = ctx.guard.params;

    await validateProtectedApplicationById(id);

    return next();
  });

  router.get(
    customDomainsPathname,
    koaGuard({
      params: z.object(params),
      status: [200, 400, 404],
      response: customDomainsGuard,
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      const {
        protectedAppMetadata: { customDomains },
      } = await syncAppCustomDomainStatus(id);

      ctx.body = customDomains ?? [];
      return next();
    }
  );

  router.post(
    customDomainsPathname,
    koaGuard({
      params: z.object(params),
      body: z.object({ domain: z.string() }),
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { domain } = ctx.guard.body;

      const { protectedAppMetadata } = await findApplicationById(id);
      assertThat(protectedAppMetadata, 'application.protected_app_not_configured');

      assertThat(
        !protectedAppMetadata.customDomains || protectedAppMetadata.customDomains.length === 0,
        'domain.limit_to_one_domain'
      );

      assertThat(
        !(await findApplicationByProtectedAppCustomDomain(domain)),
        new RequestError({
          code: 'domain.hostname_already_exists',
          status: 422,
        })
      );

      const customDomain = await addDomainToRemote(domain);
      await updateApplicationById(id, {
        protectedAppMetadata: { ...protectedAppMetadata, customDomains: [customDomain] },
      });

      ctx.status = 201;
      return next();
    }
  );
}
