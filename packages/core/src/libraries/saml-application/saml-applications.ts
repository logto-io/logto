import {
  ApplicationType,
  type SamlApplicationResponse,
  type PatchSamlApplication,
  type SamlApplicationSecret,
  type Domain,
  DomainStatus,
  adminTenantId,
} from '@logto/schemas';
import { SearchJointMode } from '@logto/schemas';
import { generateStandardId, ConsoleLog } from '@logto/shared';
import { removeUndefinedKeys, pick, deduplicate } from '@silverhand/essentials';
import chalk from 'chalk';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { assembleSamlApplication, generateKeyPairAndCertificate } from './utils.js';

const consoleLog = new ConsoleLog(chalk.magenta('SAML app custom domain'));

export const createSamlApplicationsLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById, updateApplicationById, findApplications },
    samlApplicationSecrets: {
      insertInactiveSamlApplicationSecret,
      insertActiveSamlApplicationSecret,
    },
    samlApplicationConfigs: {
      findSamlApplicationConfigByApplicationId,
      updateSamlApplicationConfig,
    },
  } = queries;

  /**
   * @remarks
   * When creating a SAML app secret, it is set to inactive by default. Since a SAML app can only have one active secret at a time, creating a new active secret will deactivate all current secrets.
   */
  const createSamlApplicationSecret = async ({
    applicationId,
    lifeSpanInYears,
    isActive = false,
  }: {
    applicationId: string;
    lifeSpanInYears: number;
    isActive?: boolean;
  }): Promise<SamlApplicationSecret> => {
    const { privateKey, certificate, notAfter } =
      await generateKeyPairAndCertificate(lifeSpanInYears);

    const createObject = {
      id: generateStandardId(),
      applicationId,
      privateKey,
      certificate,
      expiresAt: notAfter.getTime(),
    };

    return isActive
      ? insertActiveSamlApplicationSecret(createObject)
      : insertInactiveSamlApplicationSecret(createObject);
  };

  const findSamlApplicationById = async (id: string): Promise<SamlApplicationResponse> => {
    const application = await findApplicationById(id);
    assertThat(
      application.type === ApplicationType.SAML,
      new RequestError({
        code: 'application.saml.saml_application_only',
        status: 422,
      })
    );

    const samlConfig = await findSamlApplicationConfigByApplicationId(application.id);

    return assembleSamlApplication({ application, samlConfig });
  };

  const updateSamlApplicationById = async (
    id: string,
    patchApplicationObject: PatchSamlApplication
  ): Promise<SamlApplicationResponse> => {
    const { name, description, customData, ...config } = patchApplicationObject;
    const applicationData = removeUndefinedKeys(
      pick(patchApplicationObject, 'name', 'description', 'customData')
    );

    const originalApplication = await findApplicationById(id);
    assertThat(
      originalApplication.type === ApplicationType.SAML,
      new RequestError({
        code: 'application.saml.saml_application_only',
        status: 422,
      })
    );

    // Can not put this in a single Promise.all with `findApplicationById()` we want to API to throw SAML app only error before throwing other errors.
    const originalAppConfig = await findSamlApplicationConfigByApplicationId(id);

    const [updatedApplication, upToDateSamlConfig] = await Promise.all([
      Object.keys(applicationData).length > 0
        ? updateApplicationById(id, applicationData)
        : originalApplication,
      Object.keys(config).length > 0
        ? updateSamlApplicationConfig({
            set: { ...originalAppConfig, ...config },
            where: { applicationId: id },
            jsonbMode: 'replace',
          })
        : originalAppConfig,
    ]);

    return assembleSamlApplication({
      application: updatedApplication,
      samlConfig: upToDateSamlConfig,
    });
  };

  /**
   * Applies custom domain configuration to SAML application redirect URIs.
   *
   * @param currentTenantId - The ID of the current tenant used for constructing default hostname URIs
   * @param domains - Current tenant custom domain status, if there is no custom domain, pass `undefined`
   * @returns
   *
   * @example
   * // With active domain
   * const app = { redirectUris: ['https://original.example.com'] };
   * syncCustomDomainsToSamlApplicationRedirectUrls('tenant1'， { domain: 'https://custom.domain.com' });
   * // redirectUris becomes ['https://original.example.com', 'https://custom.domain.com']
   *
   * @example
   * // Without active domain
   * const app = { redirectUris: ['https://original.example.com', 'https://custom.domain.com'] };
   * syncCustomDomainsToSamlApplicationRedirectUrls('tenant1');
   * // redirectUris becomes ['https://original.example.com']
   *
   * @remarks
   * For most apps, the redirectUris are typically other domains and are not affected by Logto's custom domain. However, the redirectUris for a SAML app are Logto's endpoints (refer to the design of the SAML app). To prevent the OIDC "Invalid redirect URI" error during redirection, it is necessary to add a corresponding custom domain value to the default redirect URI in the redirectUris (which is automatically added when creating the SAML app) during the redirection process.
   * Therefore, we need to call this method when the custom domain is updated.
   *
   * Ref:
   * - SAML application: https://github.com/logto-io/rfcs-internal/pull/5
   */
  const syncCustomDomainsToSamlApplicationRedirectUrls = async (
    currentTenantId: string,
    domains: Domain[]
  ) => {
    // Skip for admin tenant and non-cloud environment.
    if (currentTenantId === adminTenantId || !EnvSet.values.isCloud) {
      return;
    }

    // Find all SAML applications for the current tenant.
    const samlApplications = await findApplications({
      // Empty search to satisfy the input params type definition.
      search: { matches: [], joint: SearchJointMode.Or, isCaseSensitive: false },
      types: [ApplicationType.SAML],
    });

    const applyCustomDomain = (url: string, domain: Domain): string => {
      const parsedUrl = new URL(url);

      // Apply custom domain to SAML applications' redirect URIs if the custom domain is active.
      if (domain.status === DomainStatus.Active) {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        parsedUrl.hostname = domain.domain;
      }

      return parsedUrl.toString();
    };

    await Promise.all(
      samlApplications.map(async (samlApplication) => {
        const defaultRedirectUri = samlApplication.oidcClientMetadata.redirectUris.find((url) =>
          url.startsWith(getTenantEndpoint(currentTenantId, EnvSet.values).toString())
        );

        // Should not happen.
        if (!defaultRedirectUri) {
          consoleLog.warn(
            `Can not apply custom domain to SAML app ${samlApplication.id}, since we can not find default redirect URI.`
          );
          return;
        }

        const newRedirectUris = deduplicate([
          defaultRedirectUri,
          // If the custom domain is deleted or not active, we should remove all custom domains from the redirect URIs.
          ...domains.map((domain) => applyCustomDomain(defaultRedirectUri, domain)),
        ]);

        await updateApplicationById(samlApplication.id, {
          oidcClientMetadata: {
            ...samlApplication.oidcClientMetadata,
            redirectUris: newRedirectUris,
          },
        });
      })
    );
  };

  return {
    createSamlApplicationSecret,
    findSamlApplicationById,
    updateSamlApplicationById,
    syncCustomDomainsToSamlApplicationRedirectUrls,
  };
};
