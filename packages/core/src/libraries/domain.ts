import { type CloudflareData, type Domain, DomainStatus } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import type Queries from '#src/tenants/Queries.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import {
  getCustomHostname,
  createCustomHostname,
  deleteCustomHostname,
  getFallbackOrigin,
} from '#src/utils/cloudflare/index.js';
import { clearCustomDomainCache } from '#src/utils/tenant.js';

export type DomainLibrary = ReturnType<typeof createDomainLibrary>;

const getDomainStatusFromCloudflareData = (data: CloudflareData): DomainStatus => {
  switch (data.status) {
    case 'active': {
      return data.ssl.status === 'active' ? DomainStatus.Active : DomainStatus.PendingSsl;
    }
    default: {
      return DomainStatus.PendingVerification;
    }
  }
};

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
      await deleteCustomHostname(hostnameProviderConfig, domain.cloudflareData.id);
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
