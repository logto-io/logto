import { type CloudflareData, type Domain, DomainStatus } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import {
  getCustomHostname,
  createCustomHostname,
  deleteCustomHostname,
  getFallbackOrigin,
  getDomainStatusFromCloudflareData,
} from '#src/utils/cloudflare/index.js';
import { isSubdomainOf } from '#src/utils/domain.js';
import { clearCustomDomainCache } from '#src/utils/tenant.js';

export type DomainCleanupSummary = {
  scannedCount: number;
  deletedCount: number;
  skippedActiveCount: number;
  failedCount: number;
};

export type DomainLibrary = ReturnType<typeof createDomainLibrary>;

export const createDomainLibrary = (queries: Queries) => {
  const {
    domains: { updateDomainById, insertDomain, findAllDomains, findDomainById, deleteDomainById },
  } = queries;

  const syncDomainStatusFromCloudflareData = async (
    domain: Domain,
    cloudflareData: CloudflareData
  ): Promise<Domain> => {
    const status = getDomainStatusFromCloudflareData(cloudflareData);
    const {
      verification_errors: verificationErrors,
      ssl: { validation_errors: sslVerificationErrors },
    } = cloudflareData;

    const errorMessage: string = [
      ...(verificationErrors ?? []),
      ...(sslVerificationErrors ?? []).map(({ message }) => message),
    ]
      .filter(Boolean)
      .join('\n');

    return updateDomainById(domain.id, { cloudflareData, errorMessage, status }, 'replace');
  };

  const syncDomainStatus = async (domain: Domain): Promise<Domain> => {
    const { hostnameProviderConfig } = SystemContext.shared;
    assertThat(hostnameProviderConfig, 'domain.not_configured');

    assertThat(domain.cloudflareData, 'domain.cloudflare_data_missing');

    const cloudflareData = await getCustomHostname(
      hostnameProviderConfig,
      domain.cloudflareData.id
    );

    const updatedDomain = await syncDomainStatusFromCloudflareData(domain, cloudflareData);

    await clearCustomDomainCache(domain.domain);
    return updatedDomain;
  };

  const addDomain = async (hostname: string): Promise<Domain> => {
    const { hostnameProviderConfig } = SystemContext.shared;
    assertThat(hostnameProviderConfig, 'domain.not_configured');

    const { blockedDomains } = hostnameProviderConfig;
    assertThat(
      !(blockedDomains ?? []).some(
        (domain) => hostname === domain || isSubdomainOf(hostname, domain)
      ),
      'domain.domain_is_not_allowed'
    );

    const [fallbackOrigin, cloudflareData] = await Promise.all([
      getFallbackOrigin(hostnameProviderConfig),
      createCustomHostname(hostnameProviderConfig, hostname),
    ]);

    const insertedDomain = await insertDomain({
      domain: hostname,
      id: generateStandardId(),
      cloudflareData,
      status: DomainStatus.PendingVerification,
      dnsRecords: [
        {
          type: 'CNAME',
          name: hostname,
          value: fallbackOrigin,
        },
      ],
    });
    await clearCustomDomainCache(hostname);
    return insertedDomain;
  };

  const deleteDomain = async (id: string) => {
    const { hostnameProviderConfig } = SystemContext.shared;
    assertThat(hostnameProviderConfig, 'domain.not_configured');

    const domain = await findDomainById(id);

    if (domain.cloudflareData?.id) {
      try {
        await deleteCustomHostname(hostnameProviderConfig, domain.cloudflareData.id);
      } catch (error: unknown) {
        // Ignore not found error, since we are deleting the domain anyway
        if (!(error instanceof RequestError) || error.code !== 'domain.cloudflare_not_found') {
          throw error;
        }
      }
    }

    await deleteDomainById(id);
    await clearCustomDomainCache(domain.domain);
  };

  const cleanupDomains = async (staleDays: number): Promise<DomainCleanupSummary> => {
    const { hostnameProviderConfig } = SystemContext.shared;
    assertThat(hostnameProviderConfig, 'domain.not_configured');

    const staleBefore = Date.now() - staleDays * 24 * 60 * 60 * 1000;
    const domains = await findAllDomains();
    const summary: DomainCleanupSummary = {
      scannedCount: domains.length,
      deletedCount: 0,
      skippedActiveCount: 0,
      failedCount: 0,
    };

    // Process domains sequentially to avoid Cloudflare rate limits
    /* eslint-disable no-await-in-loop, @silverhand/fp/no-mutation, @silverhand/fp/no-let */
    for (const domain of domains) {
      // Orphan record without Cloudflare data, delete from DB
      if (!domain.cloudflareData) {
        try {
          await deleteDomainById(domain.id);
          await clearCustomDomainCache(domain.domain);
          summary.deletedCount += 1;
        } catch {
          summary.failedCount += 1;
        }
        continue;
      }

      // Check real-time status from Cloudflare (source of truth)
      let cloudflareData: CloudflareData;
      try {
        cloudflareData = await getCustomHostname(hostnameProviderConfig, domain.cloudflareData.id);
      } catch (error: unknown) {
        // Hostname already gone from Cloudflare, clean up DB record
        if (error instanceof RequestError && error.code === 'domain.cloudflare_not_found') {
          try {
            await deleteDomainById(domain.id);
            await clearCustomDomainCache(domain.domain);
            summary.deletedCount += 1;
          } catch {
            summary.failedCount += 1;
          }
          continue;
        }
        summary.failedCount += 1;
        continue;
      }

      const status = getDomainStatusFromCloudflareData(cloudflareData);

      // Active in Cloudflare, sync DB status and skip
      if (status === DomainStatus.Active) {
        await trySafe(async () => syncDomainStatusFromCloudflareData(domain, cloudflareData));
        summary.skippedActiveCount += 1;
        continue;
      }

      // Non-active but created recently, skip
      if (domain.createdAt >= staleBefore) {
        continue;
      }

      // Stale non-active domain, delete from both Cloudflare and DB
      try {
        await deleteDomain(domain.id);
        summary.deletedCount += 1;
      } catch {
        summary.failedCount += 1;
      }
    }
    /* eslint-enable no-await-in-loop, @silverhand/fp/no-mutation, @silverhand/fp/no-let */

    return summary;
  };

  return {
    syncDomainStatus,
    addDomain,
    deleteDomain,
    cleanupDomains,
  };
};
