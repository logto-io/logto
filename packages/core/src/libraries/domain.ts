import {
  type CloudflareData,
  type Domain,
  type DomainDnsRecords,
  DomainStatus,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';

import type Queries from '#src/tenants/Queries.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getCustomHostname, createCustomHostname } from '#src/utils/cloudflare/index.js';

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
    domains: { updateDomainById, insertDomain },
  } = queries;

  const syncDomainStatusFromCloudflareData = async (
    domain: Domain,
    cloudflareData: CloudflareData,
    origin: string
  ): Promise<Domain> => {
    const status = getDomainStatusFromCloudflareData(cloudflareData);
    const {
      verification_errors: verificationErrors,
      ssl: { validation_errors: sslVerificationErrors, txt_name: txtName, txt_value: txtValue },
      ownership_verification: ownershipVerification,
    } = cloudflareData;

    const errorMessage: string = [
      ...(verificationErrors ?? []),
      ...(sslVerificationErrors ?? []).map(({ message }) => message),
    ]
      .filter(Boolean)
      .join('\n');

    const sslRecord = conditional(
      txtName && txtValue && { type: 'TXT', name: txtName, value: txtValue }
    );
    const cnameRecord = conditional(
      (status === DomainStatus.PendingVerification || status === DomainStatus.Error) && {
        type: 'CNAME',
        name: domain.domain,
        value: origin,
      }
    );
    const dnsRecords: DomainDnsRecords = [cnameRecord, ownershipVerification, sslRecord].filter(
      Boolean
    );

    return updateDomainById(
      domain.id,
      { cloudflareData, errorMessage, dnsRecords, status },
      'replace'
    );
  };

  const syncDomainStatus = async (domain: Domain): Promise<Domain> => {
    const { hostnameProviderConfig } = SystemContext.shared;
    assertThat(hostnameProviderConfig, 'domain.not_configured');

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

  const addDomain = async (hostname: string): Promise<Domain> => {
    const { hostnameProviderConfig } = SystemContext.shared;
    assertThat(hostnameProviderConfig, 'domain.not_configured');

    const cloudflareData = await createCustomHostname(hostnameProviderConfig, hostname);

    return insertDomain({
      domain: hostname,
      id: generateStandardId(),
      cloudflareData,
      status: DomainStatus.PendingVerification,
    });
  };

  return {
    syncDomainStatus,
    addDomain,
  };
};
