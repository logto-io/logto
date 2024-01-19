import { DomainStatus, type Application, type ProtectedAppMetadata } from '@logto/schemas';
import { isValidSubdomain } from '@logto/shared';

import { EnvSet } from '#src/env-set/index.js';
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
  deleteProtectedAppSiteConfigs,
  getFallbackOrigin,
  updateProtectedAppSiteConfigs,
} from '#src/utils/cloudflare/index.js';
import { isSubdomainOf } from '#src/utils/domain.js';

export type ProtectedAppLibrary = ReturnType<typeof createProtectedAppLibrary>;

const getProviderConfig = async () => {
  const { protectedAppConfigProviderConfig } = SystemContext.shared;
  assertThat(protectedAppConfigProviderConfig, 'application.protected_app_not_configured');

  return protectedAppConfigProviderConfig;
};

const getHostnameProviderConfig = async () => {
  const { protectedAppHostnameProviderConfig } = SystemContext.shared;
  assertThat(protectedAppHostnameProviderConfig, 'application.protected_app_not_configured');

  return protectedAppHostnameProviderConfig;
};

const deleteRemoteAppConfigs = async (host: string): Promise<void> => {
  if (EnvSet.values.isIntegrationTest) {
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
 * Call Cloudflare API to add the domain (custom hostname) to the remote
 * and get the DNS records to be added to the DNS provider
 */
const addDomainToRemote = async (
  hostname: string
): Promise<NonNullable<ProtectedAppMetadata['customDomains']>[number]> => {
  const hostnameProviderConfig = await getHostnameProviderConfig();
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

  return {
    domain: hostname,
    cloudflareData,
    status: DomainStatus.PendingVerification,
    error: null,
    dnsRecords: [
      {
        type: 'CNAME',
        name: hostname,
        value: fallbackOrigin,
      },
    ],
  };
};

export const createProtectedAppLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById, findApplicationByProtectedAppHost, updateApplicationById },
  } = queries;

  const syncAppConfigsToRemote = async (applicationId: string): Promise<void> => {
    // Skip for integration test, we don't do third party call in integration test
    if (EnvSet.values.isIntegrationTest) {
      return;
    }

    const protectedAppConfigProviderConfig = await getProviderConfig();

    const { protectedAppMetadata, id, secret } = await findApplicationById(applicationId);
    if (!protectedAppMetadata) {
      return;
    }

    await updateProtectedAppSiteConfigs(
      protectedAppConfigProviderConfig,
      protectedAppMetadata.host,
      {
        ...protectedAppMetadata,
        sdkConfig: {
          appId: id,
          appSecret: secret,
          endpoint: EnvSet.values.endpoint.href,
        },
      }
    );
  };

  /**
   * Build application data for protected app
   * check if subdomain is valid
   * generate host based on subdomain
   * generate default protectedAppMetadata based on host and origin
   * generate redirectUris and postLogoutRedirectUris based on host
   */
  const checkAndBuildProtectedAppData = async ({
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

    const application = await findApplicationByProtectedAppHost(host);

    assertThat(
      !application,
      new RequestError({
        code: 'application.protected_application_subdomain_exists',
        status: 422,
      })
    );

    return {
      protectedAppMetadata: {
        host,
        origin,
        sessionDuration: defaultProtectedAppSessionDuration,
        pageRules: defaultProtectedAppPageRules,
      },
      oidcClientMetadata: {
        redirectUris: [`https://${host}/callback`],
        postLogoutRedirectUris: [`https://${host}`],
      },
    };
  };

  return {
    syncAppConfigsToRemote,
    deleteRemoteAppConfigs,
    checkAndBuildProtectedAppData,
    getDefaultDomain,
    addDomainToRemote,
  };
};
