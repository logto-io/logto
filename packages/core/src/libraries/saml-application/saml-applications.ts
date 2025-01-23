import {
  ApplicationType,
  type SamlApplicationResponse,
  type PatchSamlApplication,
  type SamlApplicationSecret,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { removeUndefinedKeys, pick } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { ensembleSamlApplication, generateKeyPairAndCertificate } from './utils.js';

export const createSamlApplicationsLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById, updateApplicationById },
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

  return {
    createSamlApplicationSecret,
    findSamlApplicationById,
    updateSamlApplicationById,
  };
};
