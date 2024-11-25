import {
  ApplicationType,
  type SamlApplicationResponse,
  type PatchSamlApplication,
  type SamlApplicationSecret,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { removeUndefinedKeys } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { ensembleSamlApplication, generateKeyPairAndCertificate } from './utils.js';

export const createSamlApplicationsLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById, updateApplicationById },
    samlApplicationSecrets: { insertSamlApplicationSecret },
    samlApplicationConfigs: {
      findSamlApplicationConfigByApplicationId,
      updateSamlApplicationConfig,
    },
  } = queries;

  const createSamlApplicationSecret = async (
    applicationId: string,
    // Set certificate life span to 1 year by default.
    lifeSpanInDays = 365
  ): Promise<SamlApplicationSecret> => {
    const { privateKey, certificate, notAfter } = await generateKeyPairAndCertificate(
      lifeSpanInDays
    );

    return insertSamlApplicationSecret({
      id: generateStandardId(),
      applicationId,
      privateKey,
      certificate,
      expiresAt: Math.floor(notAfter.getTime() / 1000),
      active: false,
    });
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
    const { config, ...applicationData } = patchApplicationObject;
    const originalApplication = await findApplicationById(id);

    assertThat(
      originalApplication.type === ApplicationType.SAML,
      new RequestError({
        code: 'application.saml.saml_application_only',
        status: 422,
      })
    );

    const [updatedApplication, upToDateSamlConfig] = await Promise.all([
      Object.keys(applicationData).length > 0
        ? updateApplicationById(id, removeUndefinedKeys(applicationData))
        : originalApplication,
      config
        ? updateSamlApplicationConfig({
            set: config,
            where: { applicationId: id },
            jsonbMode: 'replace',
          })
        : findSamlApplicationConfigByApplicationId(id),
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
