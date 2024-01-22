import { type CloudflareData, type Domain, DomainStatus } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

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

export type DomainLibrary = ReturnType<typeof createDomainLibrary>;

export const createDomainLibrary = (queries: Queries) => {
  const {
    domains: { updateDomainById, insertDomain, findDomainById, deleteDomainById },
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

  return {
    syncDomainStatus,
    addDomain,
    deleteDomain,
  };
};
