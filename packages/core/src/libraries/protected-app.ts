import {
  ApplicationType,
  DomainStatus,
  SearchJointMode,
  type Application,
  type ProtectedAppConfigProviderData,
  type ProtectedAppMetadata,
  type CustomDomain,
} from '@logto/schemas';
import { isValidSubdomain } from '@logto/shared';
import { conditional } from '@silverhand/essentials';

import { protectedAppSignInCallbackUrl } from '#src/constants/index.js';
import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  defaultProtectedAppPageRules,
  defaultProtectedAppSessionDuration,
} from '#src/routes/applications/constants.js';
import type Queries from '#src/tenants/Queries.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import {
  createCustomHostname,
  deleteCustomHostname,
  deleteProtectedAppSiteConfigs,
  getCustomHostname,
  getDomainStatusFromCloudflareData,
  getFallbackOrigin,
  updateProtectedAppSiteConfigs,
} from '#src/utils/cloudflare/index.js';
import { isSubdomainOf } from '#src/utils/domain.js';

export type ProtectedAppLibrary = ReturnType<typeof createProtectedAppLibrary>;

const localProtectedAppConfigProviderConfig: ProtectedAppConfigProviderData = {
  accountIdentifier: 'local',
  namespaceIdentifier: 'local',
  keyName: 'local',
  domain: 'protected-app.localhost',
  apiToken: 'local',
};

const getProviderConfig = async () => {
  const { protectedAppConfigProviderConfig } = SystemContext.shared;
  if (protectedAppConfigProviderConfig) {
    return protectedAppConfigProviderConfig;
  }

  if (EnvSet.values.isProtectedAppLocalDevEnabled) {
    return localProtectedAppConfigProviderConfig;
  }

  assertThat(protectedAppConfigProviderConfig, 'application.protected_app_not_configured', 501);

  return protectedAppConfigProviderConfig;
};

const getHostnameProviderConfig = async () => {
  const { protectedAppHostnameProviderConfig } = SystemContext.shared;
  assertThat(protectedAppHostnameProviderConfig, 'application.protected_app_not_configured', 501);

  return protectedAppHostnameProviderConfig;
};

const deleteRemoteAppConfigs = async (host: string): Promise<void> => {
  if (EnvSet.values.isIntegrationTest || EnvSet.values.isProtectedAppLocalDevEnabled) {
    return;
  }

  const protectedAppConfigProviderConfig = await getProviderConfig();

  await deleteProtectedAppSiteConfigs(protectedAppConfigProviderConfig, host);
};

/**
 * Get default domain from provider config, this is used for front-end display
 */
const getDefaultDomain = async () => {
  const { domain } = await getProviderConfig();
  return domain;
};

/**
 * Build application data for protected app
 * check if subdomain is valid
 * generate host based on subdomain
 * generate default protectedAppMetadata based on host and origin
 * generate redirectUris and postLogoutRedirectUris based on host
 */
const buildProtectedAppData = async ({
  subDomain,
  origin,
}: {
  subDomain: string;
  origin: string;
}): Promise<Pick<Application, 'protectedAppMetadata' | 'oidcClientMetadata'>> => {
  assertThat(
    isValidSubdomain(subDomain),
    new RequestError({
      code: 'application.invalid_subdomain',
      status: 422,
    })
  );

  // Skip for integration test, use empty value instead
  const { domain } = EnvSet.values.isIntegrationTest ? { domain: '' } : await getProviderConfig();
  const host = `${subDomain}.${domain}`;

  return {
    protectedAppMetadata: {
      host,
      origin,
      sessionDuration: defaultProtectedAppSessionDuration,
      pageRules: defaultProtectedAppPageRules,
      ...conditional(EnvSet.values.isDevFeaturesEnabled && { additionalScopes: [] }),
    },
    oidcClientMetadata: {
      redirectUris: [`https://${host}/${protectedAppSignInCallbackUrl}`],
      postLogoutRedirectUris: [`https://${host}`],
    },
  };
};

/**
 * Call Cloudflare API to add the domain (custom hostname) to the remote
 * and get the DNS records to be added to the DNS provider
 */
const addDomainToRemote = async (
  hostname: string
): Promise<NonNullable<ProtectedAppMetadata['customDomains']>[number]> => {
  if (EnvSet.values.isProtectedAppLocalDevEnabled) {
    return {
      domain: hostname,
      cloudflareData: null,
      status: DomainStatus.Active,
      errorMessage: null,
      dnsRecords: [],
    };
  }

  const hostnameProviderConfig = await getHostnameProviderConfig();
  const { blockedDomains } = hostnameProviderConfig;
  assertThat(
    !(blockedDomains ?? []).some(
      (domain) => hostname === domain || isSubdomainOf(hostname, domain)
    ),
    'domain.domain_is_not_allowed',
    422
  );

  const [fallbackOrigin, cloudflareData] = await Promise.all([
    getFallbackOrigin(hostnameProviderConfig),
    createCustomHostname(hostnameProviderConfig, hostname),
  ]);

  return {
    domain: hostname,
    cloudflareData,
    status: DomainStatus.PendingVerification,
    errorMessage: null,
    dnsRecords: [
      {
        type: 'CNAME',
        name: hostname,
        value: fallbackOrigin,
      },
    ],
  };
};

/**
 * Call Cloudflare API to delete the domain (custom hostname)
 */
const deleteDomainFromRemote = async (id: string) => {
  if (EnvSet.values.isProtectedAppLocalDevEnabled) {
    return;
  }

  const hostnameProviderConfig = await getHostnameProviderConfig();
  await deleteCustomHostname(hostnameProviderConfig, id);
};

export const createProtectedAppLibrary = (queries: Queries) => {
  const {
    applications: { findApplications, findApplicationById, updateApplicationById },
    domains: { findAllDomains },
  } = queries;

  const getSdkEndpoint = async (tenantId: string) => {
    const defaultEndpoint = getTenantEndpoint(tenantId, EnvSet.values).origin;

    if (!EnvSet.values.isDevFeaturesEnabled) {
      return defaultEndpoint;
    }

    const domains = await findAllDomains();
    const activeCustomDomain = domains
      .filter(({ status }) => status === DomainStatus.Active)
      .slice()
      .sort((left, right) => right.createdAt - left.createdAt)[0];

    return activeCustomDomain
      ? new URL(`https://${activeCustomDomain.domain}`).origin
      : defaultEndpoint;
  };

  const syncAppConfigsToRemote = async (
    applicationId: string,
    sdkEndpointOverride?: string
  ): Promise<void> => {
    // Skip for integration test, we don't do third party call in integration test
    if (EnvSet.values.isIntegrationTest || EnvSet.values.isProtectedAppLocalDevEnabled) {
      return;
    }

    const protectedAppConfigProviderConfig = await getProviderConfig();

    const { protectedAppMetadata, id, tenantId } = await findApplicationById(applicationId);
    if (!protectedAppMetadata) {
      return;
    }

    const activeSecret =
      await queries.applicationSecrets.findActiveSecretByApplicationId(applicationId);
    const { customDomains, additionalScopes, ...rest } = protectedAppMetadata;
    const sdkEndpoint = sdkEndpointOverride ?? (await getSdkEndpoint(tenantId));

    const siteConfigs = {
      ...rest,
      ...conditional(
        EnvSet.values.isDevFeaturesEnabled && additionalScopes !== undefined && { additionalScopes }
      ),
      sdkConfig: {
        appId: id,
        appSecret: activeSecret.value,
        endpoint: sdkEndpoint,
      },
    };

    // Update default host (subdomain of the default domain)
    await updateProtectedAppSiteConfigs(
      protectedAppConfigProviderConfig,
      protectedAppMetadata.host,
      siteConfigs
    );

    // Update custom domains sites
    if (customDomains && customDomains.length > 0) {
      await Promise.all(
        customDomains.map(async ({ domain }) => {
          await updateProtectedAppSiteConfigs(protectedAppConfigProviderConfig, domain, {
            ...siteConfigs,
            host: domain,
          });
        })
      );
    }
  };

  const syncAllAppConfigsToRemote = async (): Promise<void> => {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    const protectedApplications = await findApplications({
      search: { matches: [], joint: SearchJointMode.Or, isCaseSensitive: false },
      types: [ApplicationType.Protected],
    });

    const [firstProtectedApplication] = protectedApplications;

    if (!firstProtectedApplication) {
      return;
    }

    const sdkEndpoint = await getSdkEndpoint(firstProtectedApplication.tenantId);

    /* eslint-disable no-await-in-loop */
    for (const { id } of protectedApplications) {
      await syncAppConfigsToRemote(id, sdkEndpoint);
    }
    /* eslint-enable no-await-in-loop */
  };

  /**
   * Query domain status from Cloudflare and update the data and status in the database
   */
  const syncAppCustomDomainStatus = async (
    applicationId: string
  ): Promise<
    Omit<Application, 'protectedAppMetadata'> & {
      protectedAppMetadata: NonNullable<Application['protectedAppMetadata']>;
    }
  > => {
    const application = await findApplicationById(applicationId);
    const { protectedAppMetadata } = application;
    assertThat(protectedAppMetadata, 'application.protected_app_not_configured', 501);

    if (EnvSet.values.isProtectedAppLocalDevEnabled) {
      return {
        ...application,
        protectedAppMetadata,
      };
    }

    const { protectedAppHostnameProviderConfig } = SystemContext.shared;
    assertThat(protectedAppHostnameProviderConfig, 'domain.not_configured', 501);

    if (!protectedAppMetadata.customDomains || protectedAppMetadata.customDomains.length === 0) {
      return {
        ...application,
        protectedAppMetadata,
      };
    }

    const customDomains: CustomDomain[] = await Promise.all(
      protectedAppMetadata.customDomains.map(async (domain) => {
        assertThat(domain.cloudflareData, 'domain.cloudflare_data_missing', 501);

        const cloudflareData = await getCustomHostname(
          protectedAppHostnameProviderConfig,
          domain.cloudflareData.id
        );

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

        return {
          ...domain,
          cloudflareData,
          errorMessage: errorMessage || null,
          status,
        };
      })
    );

    const { protectedAppMetadata: updatedProtectedAppMetadata } = await updateApplicationById(
      applicationId,
      {
        protectedAppMetadata: {
          ...protectedAppMetadata,
          customDomains,
        },
      }
    );
    // Not expected to happen, just to make TS happy
    assertThat(updatedProtectedAppMetadata, 'application.protected_app_not_configured', 501);

    return {
      ...application,
      protectedAppMetadata: updatedProtectedAppMetadata,
    };
  };

  return {
    syncAppConfigsToRemote,
    deleteRemoteAppConfigs,
    buildProtectedAppData,
    getDefaultDomain,
    addDomainToRemote,
    syncAppCustomDomainStatus,
    deleteDomainFromRemote,
    syncAllAppConfigsToRemote,
  };
};
