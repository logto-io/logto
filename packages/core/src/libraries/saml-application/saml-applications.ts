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
import { generateStandardId } from '@logto/shared';
import { removeUndefinedKeys, pick } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { EnvSet } from '../../env-set/index.js';
import { getTenantEndpoint } from '../../env-set/utils.js';

import { ensembleSamlApplication, generateKeyPairAndCertificate } from './utils.js';

export type SamlApplicationLibrary = ReturnType<typeof createSamlApplicationsLibrary>;

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
    const { privateKey, certificate, notAfter } = await generateKeyPairAndCertificate(
      lifeSpanInYears
    );

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

    return ensembleSamlApplication({ application, samlConfig });
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

    return ensembleSamlApplication({
      application: updatedApplication,
      samlConfig: upToDateSamlConfig,
    });
  };

  const applyCustomDomainToSamlApplicationRedirectUrls = async (
    tenantId: string,
    domain?: Domain
  ) => {
    // Skip for admin tenant and non-cloud environment.
    if (tenantId === adminTenantId || !EnvSet.values.isCloud) {
      return;
    }

    const samlApplications = await findApplications({
      // Empty search to satisfy the input params type definition.
      search: { matches: [], joint: SearchJointMode.Or, isCaseSensitive: false },
      types: [ApplicationType.SAML],
    });

    if (!domain || domain.status !== DomainStatus.Active) {
      for (const samlApplication of samlApplications) {
        const newRedirectUris = samlApplication.oidcClientMetadata.redirectUris.filter((url) =>
          url.startsWith(getTenantEndpoint(tenantId, EnvSet.values).hostname)
        );

        if (newRedirectUris.length === 1) {
          continue;
        }

        // eslint-disable-next-line no-await-in-loop
        await updateApplicationById(samlApplication.id, {
          oidcClientMetadata: {
            ...samlApplication.oidcClientMetadata,
            redirectUris: newRedirectUris,
          },
        });
      }
    }

    if (domain?.status === DomainStatus.Active) {
      for (const samlApplication of samlApplications) {
        const redirectUri = samlApplication.oidcClientMetadata.redirectUris.find((url) =>
          url.startsWith(getTenantEndpoint(tenantId, EnvSet.values).hostname)
        );

        // Should not happen.
        if (!redirectUri) {
          continue;
        }

        const redirectUriWithCustomDomain = new URL(redirectUri);
        // eslint-disable-next-line @silverhand/fp/no-mutation
        redirectUriWithCustomDomain.hostname = domain.domain;

        // eslint-disable-next-line no-await-in-loop
        await updateApplicationById(samlApplication.id, {
          oidcClientMetadata: {
            ...samlApplication.oidcClientMetadata,
            redirectUris: [redirectUri, redirectUriWithCustomDomain.toString()],
          },
        });
      }
    }
  };

  return {
    createSamlApplicationSecret,
    findSamlApplicationById,
    updateSamlApplicationById,
    applyCustomDomainToSamlApplicationRedirectUrls,
  };
};
