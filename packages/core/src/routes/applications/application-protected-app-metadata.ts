import { customDomainsGuard } from '@logto/schemas';
import { z } from 'zod';

import { protectedAppSignInCallbackUrl } from '#src/constants/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function applicationProtectedAppMetadataRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries: {
        applications: { findApplicationById, updateApplicationById },
      },
      libraries: {
        applications: { validateProtectedApplicationById },
        protectedApps: {
          addDomainToRemote,
          syncAppCustomDomainStatus,
          syncAppConfigsToRemote,
          deleteDomainFromRemote,
          deleteRemoteAppConfigs,
        },
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
      status: [200, 400, 404, 501],
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
      status: [201, 400, 404, 422, 501],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { domain } = ctx.guard.body;

      const { protectedAppMetadata, oidcClientMetadata } = await findApplicationById(id);
      assertThat(protectedAppMetadata, 'application.protected_app_not_configured', 501);

      // Only allow one domain, be careful when changing this, the unique index on the database
      // is based on this assumption
      assertThat(
        !protectedAppMetadata.customDomains || protectedAppMetadata.customDomains.length === 0,
        'domain.limit_to_one_domain',
        422
      );

      const customDomain = await addDomainToRemote(domain);
      await updateApplicationById(id, {
        protectedAppMetadata: { ...protectedAppMetadata, customDomains: [customDomain] },
        oidcClientMetadata: {
          redirectUris: [
            ...oidcClientMetadata.redirectUris,
            `https://${domain}/${protectedAppSignInCallbackUrl}`,
          ],
          postLogoutRedirectUris: [
            ...oidcClientMetadata.postLogoutRedirectUris,
            `https://${domain}`,
          ],
        },
      });

      try {
        await syncAppConfigsToRemote(id);
      } catch (error: unknown) {
        // Revert changes
        await updateApplicationById(id, { protectedAppMetadata, oidcClientMetadata });
        throw error;
      }

      ctx.status = 201;
      return next();
    }
  );

  router.delete(
    `${customDomainsPathname}/:domain`,
    koaGuard({
      params: z.object({
        ...params,
        domain: z.string(),
      }),
      status: [204, 404, 501],
    }),
    async (ctx, next) => {
      const { id, domain } = ctx.guard.params;

      const { protectedAppMetadata, oidcClientMetadata } = await findApplicationById(id);

      const domainObject = protectedAppMetadata?.customDomains?.find(
        ({ domain: domainName }) => domainName === domain
      );

      assertThat(
        protectedAppMetadata && domainObject,
        new RequestError({
          code: 'application.custom_domain_not_found',
          status: 404,
        })
      );

      // Remove domain from Cloudflare
      if (domainObject.cloudflareData?.id) {
        await deleteDomainFromRemote(domainObject.cloudflareData.id);
      }

      // Remove site configs
      await deleteRemoteAppConfigs(domain);

      await updateApplicationById(id, {
        oidcClientMetadata: {
          ...oidcClientMetadata,
          redirectUris: oidcClientMetadata.redirectUris.filter(
            (uri) => uri !== `https://${domain}/${protectedAppSignInCallbackUrl}`
          ),
          postLogoutRedirectUris: oidcClientMetadata.postLogoutRedirectUris.filter(
            (uri) => uri !== `https://${domain}`
          ),
        },
        protectedAppMetadata: {
          ...protectedAppMetadata,
          customDomains: protectedAppMetadata.customDomains?.filter(
            ({ domain: domainName }) => domainName !== domain
          ),
        },
      });

      ctx.status = 204;

      return next();
    }
  );
}
