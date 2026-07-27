import { type CertificateFingerprints } from '@logto/schemas';

/**
 * The shared shape of a SAML signing certificate row — satisfied by both the SAML application
 * secret and the SSO connector SP signing key management API responses.
 */
export type CertificateData = {
  id: string;
  certificate: string;
  expiresAt: number;
  active: boolean;
  fingerprints: CertificateFingerprints;
};
