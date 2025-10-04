import crypto from 'node:crypto';

import {
  type SamlApplicationResponse,
  type Application,
  type SamlApplicationConfig,
  type SamlAcsUrl,
  BindingType,
  type CertificateFingerprints,
} from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { addYears } from 'date-fns';
import forge from 'node-forge';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

// Add PEM certificate validation
const pemCertificateGuard = z
  .string()
  .trim()
  .regex(/^-{5}BEGIN CERTIFICATE-{5}[\n\r]+[\S\s]*?[\n\r]+-{5}END CERTIFICATE-{5}$/);

// Add base64 validation schema
const base64Guard = z.string().regex(/^[\d+/A-Za-z]*={0,2}$/);

export const generateKeyPairAndCertificate = async (lifeSpanInYears: number) => {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 4096 });
  return createCertificate(keypair, lifeSpanInYears);
};

const createCertificate = (keypair: forge.pki.KeyPair, lifeSpanInYears: number) => {
  const cert = forge.pki.createCertificate();
  const notBefore = new Date();
  const notAfter = addYears(notBefore, lifeSpanInYears);

  // Can not initialize the certificate with the keypair directly, so we need to set the public key manually.
  /* eslint-disable @silverhand/fp/no-mutation */
  cert.publicKey = keypair.publicKey;
  // Use cryptographically secure pseudorandom number generator (CSPRNG) to generate a random serial number (usually more than 8 bytes).
  // `serialNumber` should be IDENTICAL across different certificates, better not to be incremental.
  cert.serialNumber = crypto.randomBytes(16).toString('hex');
  cert.validity.notBefore = notBefore;
  cert.validity.notAfter = notAfter;
  /* eslint-enable @silverhand/fp/no-mutation */

  // TODO: read from tenant config or let user customize before downloading
  const subjectAttributes: forge.pki.CertificateField[] = [
    {
      name: 'commonName',
      value: 'example.com',
    },
  ];

  const issuerAttributes: forge.pki.CertificateField[] = [
    {
      name: 'commonName',
      value: 'logto.io',
    },
    {
      name: 'organizationName',
      value: 'Logto',
    },
    {
      name: 'countryName',
      value: 'US',
    },
  ];

  cert.setSubject(subjectAttributes);
  cert.setIssuer(issuerAttributes);
  cert.sign(keypair.privateKey);

  return {
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
    certificate: forge.pki.certificateToPem(cert),
    notAfter,
  };
};

export const calculateCertificateFingerprints = (
  pemCertificate: string
): CertificateFingerprints => {
  try {
    // Validate PEM certificate format
    pemCertificateGuard.parse(pemCertificate);

    // Remove PEM headers, newlines and spaces
    const cleanedPem = pemCertificate
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replaceAll(/\s/g, '');

    // Validate base64 format using zod
    base64Guard.parse(cleanedPem);

    // Convert base64 to binary
    const certDer = Buffer.from(cleanedPem, 'base64');

    // Calculate SHA-256 fingerprint
    const sha256Unformatted = crypto
      .createHash('sha256')
      .update(certDer)
      .digest('hex')
      .toUpperCase();
    const sha256Formatted = sha256Unformatted.match(/.{2}/g)?.join(':') ?? '';

    return {
      sha256: {
        formatted: sha256Formatted,
        unformatted: sha256Unformatted,
      },
    };
  } catch {
    throw new RequestError('application.saml.invalid_certificate_pem_format');
  }
};

/**
 * According to the design, a SAML app will be associated with multiple records from various tables.
 * Therefore, when complete SAML app data is required, it is necessary to retrieve multiple related records and assemble them into a comprehensive SAML app dataset. This dataset includes:
 * - A record from the `applications` table with a `type` of `SAML`
 * - A record from the `saml_application_configs` table
 */
export const assembleSamlApplication = ({
  application,
  samlConfig,
}: {
  application: Application;
  samlConfig: Pick<
    SamlApplicationConfig,
    'attributeMapping' | 'entityId' | 'acsUrl' | 'encryption' | 'nameIdFormat'
  >;
}): SamlApplicationResponse => {
  return {
    ...application,
    ...samlConfig,
  };
};

/**
 * Only HTTP-POST binding is supported for receiving SAML assertions at the moment.
 */
export const validateAcsUrl = (acsUrl: SamlAcsUrl) => {
  const { binding } = acsUrl;
  assertThat(
    binding === BindingType.Post,
    new RequestError({
      code: 'application.saml.acs_url_binding_not_supported',
      status: 422,
    })
  );
};

export const buildSingleSignOnUrl = (baseUrl: URL, samlApplicationId: string) =>
  appendPath(baseUrl, `api/saml/${samlApplicationId}/authn`).toString();

export const buildSamlIdentityProviderEntityId = (baseUrl: URL, samlApplicationId: string) =>
  appendPath(baseUrl, `saml/${samlApplicationId}`).toString();
