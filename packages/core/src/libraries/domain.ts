import {
  type CloudflareData,
  type Domain,
  type DomainDnsRecords,
  DomainStatus,
} from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getCustomHostname, createCustomHostname } from '#src/utils/cloudflare/index.js';

export type DomainLibrary = ReturnType<typeof createDomainLibrary>;

const getDomainStatusFromCloudflareData = (data: CloudflareData): DomainStatus => {
  if (data.status === 'active' && data.ssl.status === 'active') {
    return DomainStatus.Active;
  }

  if (data.status === 'active' && data.ssl.status !== 'active') {
    return DomainStatus.PendingSsl;
  }

  if (data.status !== 'active') {
    return DomainStatus.PendingVerification;
  }

  return DomainStatus.Error;
};

export const createDomainLibrary = (queries: Queries) => {
  const {
    domains: { updateDomainById },
  } = queries;

  const syncDomainStatusFromCloudflareData = async (
    domain: Domain,
    cloudflareData: CloudflareData,
    origin: string
  ): Promise<Domain> => {
    const status = getDomainStatusFromCloudflareData(cloudflareData);

    const verificationError =
      cloudflareData.verification_errors && cloudflareData.verification_errors.length > 0
        ? cloudflareData.verification_errors.join('\n')
        : null;
    const sslError =
      cloudflareData.ssl.validation_errors && cloudflareData.ssl.validation_errors.length > 0
        ? cloudflareData.ssl.validation_errors.map(({ message }) => message).join('\n')
        : null;
    const errorMessage = [verificationError, sslError].filter(Boolean).join('\n');

    const ownershipRecord = cloudflareData.ownership_verification;
    const { txt_name, txt_value } = cloudflareData.ssl;
    const sslRecord =
      txt_name && txt_value ? { type: 'TXT', name: txt_name, value: txt_value } : undefined;
    const cnameRecord =
      status === DomainStatus.PendingVerification || status === DomainStatus.Error
        ? {
            type: 'CNAME',
            name: domain.domain,
            value: origin,
          }
        : undefined;
    const dnsRecords: DomainDnsRecords = [cnameRecord, ownershipRecord, sslRecord].filter(Boolean);

    return updateDomainById(
      domain.id,
      { cloudflareData, errorMessage, dnsRecords, status },
      'replace'
    );
  };

  const syncDomainStatus = async (domain: Domain): Promise<Domain> => {
    const { hostnameProviderConfig } = SystemContext.shared;
    assertThat(hostnameProviderConfig, 'domain.cloudflare_data_missing');

    assertThat(domain.cloudflareData, 'domain.cloudflare_data_missing');

    const cloudflareData = await getCustomHostname(
      hostnameProviderConfig,
      domain.cloudflareData.id
    );

    return syncDomainStatusFromCloudflareData(
      domain,
      cloudflareData,
      hostnameProviderConfig.fallbackOrigin
    );
  };

  const addDomainToCloudflare = async (domain: Domain): Promise<Domain> => {
    const { hostnameProviderConfig } = SystemContext.shared;
    assertThat(hostnameProviderConfig, 'domain.not_configured');

    const cloudflareData = await createCustomHostname(hostnameProviderConfig, domain.domain);
    return syncDomainStatusFromCloudflareData(
      {
        ...domain,
        cloudflareData,
      },
      cloudflareData,
      hostnameProviderConfig.fallbackOrigin
    );
  };

  return {
    syncDomainStatus,
    addDomainToCloudflare,
  };
};
