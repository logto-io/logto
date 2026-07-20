import {
  Domains,
  ProductEvent,
  domainResponseGuard,
  domainSelectFields,
  domainVerificationFilesGuard,
} from '@logto/schemas';
import { pick, trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { EnvSet } from '../env-set/index.js';
import { assertCustomDomainLimit } from '../utils/domain.js';
import { captureEvent } from '../utils/posthog.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function domainRoutes<T extends ManagementApiRouter>(
  ...[router, { id: tenantId, queries, libraries }]: RouterInitArgs<T>
) {
  const {
    domains: { findAllDomains, findDomainById, findDomain, updateDomainById },
  } = queries;
  const {
    domains: { syncDomainStatus, addDomain, deleteDomain, cleanupDomains },
    samlApplications: { syncCustomDomainsToSamlApplicationRedirectUrls },
    protectedApps: { syncAllAppConfigsToRemote },
    quota,
  } = libraries;

  const isPrivateRegionFeature = EnvSet.values.isMultipleCustomDomainsEnabled;
  const hasDomainStatusChanged = (
    domains: Awaited<ReturnType<typeof findAllDomains>>,
    syncedDomains: Awaited<ReturnType<typeof findAllDomains>>
  ) =>
    domains.length !== syncedDomains.length ||
    syncedDomains.some(({ id, status }) => {
      const originalDomain = domains.find(({ id: originalId }) => originalId === id);

      return originalDomain?.status !== status;
    });

  const syncCustomDomainDependentConfigs = async (
    domains: Awaited<ReturnType<typeof findAllDomains>>,
    shouldSyncProtectedAppConfigs = false
  ) => {
    await trySafe(async () =>
      syncCustomDomainsToSamlApplicationRedirectUrls(tenantId, [...domains])
    );

    if (shouldSyncProtectedAppConfigs) {
      await trySafe(async () => syncAllAppConfigsToRemote());
    }
  };

  router.get(
    '/domains',
    koaGuard({ response: domainResponseGuard.array(), status: 200 }),
    async (ctx, next) => {
      const domains = await findAllDomains();
      const syncedDomains = await Promise.all(
        domains.map(async (domain) => syncDomainStatus(domain))
      );

      void syncCustomDomainDependentConfigs(
        syncedDomains,
        hasDomainStatusChanged(domains, syncedDomains)
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
        await syncCustomDomainDependentConfigs(
          syncedDomains,
          domain.status !== syncedDomain.status || hasDomainStatusChanged(domains, syncedDomains)
        );
      });

      ctx.body = pick(syncedDomain, ...domainSelectFields);

      return next();
    }
  );

  const verificationFilesPath = '/domains/:id/verification-files';

  router.get(
    verificationFilesPath,
    koaGuard({
      params: z.object({ id: z.string() }),
      response: domainVerificationFilesGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const domain = await findDomainById(ctx.guard.params.id);

      ctx.body = domain.verificationFiles;

      return next();
    }
  );

  router.put(
    verificationFilesPath,
    koaGuard({
      params: z.object({ id: z.string() }),
      body: z.object({ verificationFiles: domainVerificationFilesGuard }),
      response: domainVerificationFilesGuard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { verificationFiles } = ctx.guard.body;

      await findDomainById(id);
      const domain = await updateDomainById(id, { verificationFiles });

      ctx.body = domain.verificationFiles;

      return next();
    }
  );

  router.post(
    '/domains',
    koaGuard({
      body: Domains.createGuard.pick({ domain: true }),
      response: domainResponseGuard,
      status: [201, 422, 400, 403],
    }),
    async (ctx, next) => {
      const existingDomains = await findAllDomains();

      await assertCustomDomainLimit({
        isPrivateRegionFeature,
        quotaLibrary: quota,
        existingDomainCount: existingDomains.length,
      });

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
      if (!isPrivateRegionFeature) {
        void quota.reportSubscriptionUpdatesUsage('customDomainsLimit');
      }
      ctx.status = 201;
      ctx.body = pick(syncedDomain, ...domainSelectFields);

      captureEvent({ tenantId, request: ctx.req }, ProductEvent.CustomDomainCreated);
      return next();
    }
  );

  router.post(
    '/domains/cleanup',
    koaGuard({
      body: z.object({ staleDays: z.number().int().positive() }),
      response: z.object({
        scannedCount: z.number(),
        deletedCount: z.number(),
        skippedActiveCount: z.number(),
        failedCount: z.number(),
      }),
      status: 200,
    }),
    async (ctx, next) => {
      const { staleDays } = ctx.guard.body;
      const summary = await cleanupDomains(staleDays);

      await trySafe(async () => {
        const domains = await findAllDomains();
        const syncedDomains = await Promise.all(
          domains.map(async (domain) => syncDomainStatus(domain))
        );
        await syncCustomDomainDependentConfigs(syncedDomains, true);
      });

      ctx.status = 200;
      ctx.body = summary;
      return next();
    }
  );

  router.delete(
    '/domains/:id',
    koaGuard({ params: z.object({ id: z.string() }), status: [204, 404] }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await deleteDomain(id);

      if (!isPrivateRegionFeature) {
        void quota.reportSubscriptionUpdatesUsage('customDomainsLimit');
      }

      await trySafe(async () => {
        const domains = await findAllDomains();
        const syncedDomains = await Promise.all(
          domains.map(async (domain) => syncDomainStatus(domain))
        );
        await syncCustomDomainDependentConfigs(syncedDomains, true);
      });

      ctx.status = 204;

      captureEvent({ tenantId, request: ctx.req }, ProductEvent.CustomDomainDeleted);
      return next();
    }
  );
}
