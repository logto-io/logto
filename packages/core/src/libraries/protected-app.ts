import { EnvSet } from '#src/env-set/index.js';
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
    applications: { findApplicationById },
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

  return {
    syncAppConfigsToRemote,
    deleteRemoteAppConfigs,
  };
};
