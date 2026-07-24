import { generateStandardId } from '@logto/shared';

import type Queries from '#src/tenants/Queries.js';

import { generateKeyPairAndCertificate } from './saml-application/utils.js';

const signingKeyLifeSpanInYears = 3;

export const createSamlSsoConnectorSigningKeyLibrary = (queries: Queries) => {
  const {
    samlSsoConnectorSigningKeys: {
      insertInactiveSigningKey,
      insertActiveSigningKey,
      findActiveSigningKeyBySsoConnectorId,
      deleteSigningKeysBySsoConnectorId,
    },
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

  /** Return the connector's active SP signing key, generating one if none is active (idempotent). */
  const ensureActiveSigningKey = async (ssoConnectorId: string) => {
    const active = await findActiveSigningKeyBySsoConnectorId(ssoConnectorId);
    return active ?? createSigningKey({ ssoConnectorId, isActive: true });
  };

  const deleteSigningKeys = async (ssoConnectorId: string) => {
    await deleteSigningKeysBySsoConnectorId(ssoConnectorId);
  };

  return { createSigningKey, ensureActiveSigningKey, deleteSigningKeys };
};
