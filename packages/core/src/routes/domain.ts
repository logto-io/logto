import { Domains, domainResponseGuard, domainSelectFields } from '@logto/schemas';
import { pick, trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { EnvSet } from '../env-set/index.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function domainRoutes<T extends ManagementApiRouter>(
  ...[router, { id: tenantId, queries, libraries }]: RouterInitArgs<T>
) {
  const {
    domains: { findAllDomains, findDomainById, findDomain },
  } = queries;
  const {
    domains: { syncDomainStatus, addDomain, deleteDomain },
    samlApplications: { syncCustomDomainsToSamlApplicationRedirectUrls },
  } = libraries;

  router.get(
    '/domains',
    koaGuard({ response: domainResponseGuard.array(), status: 200 }),
    async (ctx, next) => {
      const domains = await findAllDomains();
      const syncedDomains = await Promise.all(
        domains.map(async (domain) => syncDomainStatus(domain))
      );

      void trySafe(async () =>
        syncCustomDomainsToSamlApplicationRedirectUrls(tenantId, [...syncedDomains])
      );

      ctx.body = syncedDomains.map((domain) => pick(domain, ...domainSelectFields));

      return next();
    }
  );

  router.get(
    '/domains/:id',
    koaGuard({
      params: z.object({ id: z.string() }),
      response: domainResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      const domain = await findDomainById(id);
      const syncedDomain = await syncDomainStatus(domain);

      void trySafe(async () => {
        const domains = await findAllDomains();
        const syncedDomains = await Promise.all(
          domains.map(async (domain) => syncDomainStatus(domain))
        );
        await syncCustomDomainsToSamlApplicationRedirectUrls(tenantId, [...syncedDomains]);
      });

      ctx.body = pick(syncedDomain, ...domainSelectFields);

      return next();
    }
  );

  router.post(
    '/domains',
    koaGuard({
      body: Domains.createGuard.pick({ domain: true }),
      response: domainResponseGuard,
      status: [201, 422, 400],
    }),
    async (ctx, next) => {
      if (!EnvSet.values.isMultipleCustomDomainsEnabled) {
        const existingDomains = await findAllDomains();
        assertThat(
          existingDomains.length === 0,
          new RequestError({
            code: 'domain.limit_to_one_domain',
            status: 422,
          })
        );
      }

      const { domain } = ctx.guard.body;

      assertThat(
        !(await findDomain(domain)),
        new RequestError({
          code: 'domain.domain_in_use',
          domain,
          status: 422,
        })
      );

      // Throw 400 error if domain is invalid
      const syncedDomain = await addDomain(ctx.guard.body.domain);

      ctx.status = 201;
      ctx.body = pick(syncedDomain, ...domainSelectFields);

      return next();
    }
  );

  router.delete(
    '/domains/:id',
    koaGuard({ params: z.object({ id: z.string() }), status: [204, 404] }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await deleteDomain(id);

      await trySafe(async () => {
        const domains = await findAllDomains();
        const syncedDomains = await Promise.all(
          domains.map(async (domain) => syncDomainStatus(domain))
        );
        await syncCustomDomainsToSamlApplicationRedirectUrls(tenantId, [...syncedDomains]);
      });

      ctx.status = 204;

      return next();
    }
  );
}
