import { generateStandardId } from '@logto/shared';

import type Queries from '#src/tenants/Queries.js';

import { generateKeyPairAndCertificate } from './utils.js';

export const createSamlApplicationSecretsLibrary = (queries: Queries) => {
  const {
    samlApplicationSecrets: { insertSamlApplicationSecret },
  } = queries;

  const createSamlApplicationSecret = async (
    applicationId: string,
    // Set certificate life span to 1 year by default.
    lifeSpanInDays = 365
  ) => {
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

  return {
    createSamlApplicationSecret,
  };
};
