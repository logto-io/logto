import { generateStandardId } from '@logto/shared';

import type Queries from '#src/tenants/Queries.js';

import { generateKeyPairAndCertificate } from './saml-application/utils.js';

const signingKeyLifeSpanInYears = 3;

export const createSamlSsoConnectorSigningKeyLibrary = (queries: Queries) => {
  const {
    samlSsoConnectorSigningKeys: { insertInactiveSigningKey, insertActiveSigningKey },
  } = queries;

  /** Generate a fresh SP key pair (plaintext PEM) and store it — active, or inactive for rotation. */
  const createSigningKey = async ({
    ssoConnectorId,
    isActive = false,
  }: {
    ssoConnectorId: string;
    isActive?: boolean;
  }) => {
    const { privateKey, certificate, notAfter } =
      await generateKeyPairAndCertificate(signingKeyLifeSpanInYears);

    const data = {
      id: generateStandardId(),
      ssoConnectorId,
      privateKey,
      certificate,
      expiresAt: notAfter.getTime(),
    };

    return isActive ? insertActiveSigningKey(data) : insertInactiveSigningKey(data);
  };

  return { createSigningKey };
};
