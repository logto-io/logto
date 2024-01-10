import { type Application } from '@logto/schemas';
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
  deleteProtectedAppSiteConfigs,
  updateProtectedAppSiteConfigs,
} from '#src/utils/cloudflare/index.js';

export type ProtectedAppLibrary = ReturnType<typeof createProtectedAppLibrary>;

const getProviderConfig = async () => {
  const { protectedAppConfigProviderConfig } = SystemContext.shared;
  assertThat(protectedAppConfigProviderConfig, 'application.protected_app_not_configured');

  return protectedAppConfigProviderConfig;
};

const deleteRemoteAppConfigs = async (host: string): Promise<void> => {
  if (EnvSet.values.isIntegrationTest) {
    return;
  }

  const protectedAppConfigProviderConfig = await getProviderConfig();

  await deleteProtectedAppSiteConfigs(protectedAppConfigProviderConfig, host);
};

export const createProtectedAppLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById, findApplicationByProtectedAppHost },
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
  };
};
