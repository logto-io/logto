import { addDays, addYears } from 'date-fns';
import forge from 'node-forge';

import RequestError from '#src/errors/RequestError/index.js';

import { generateKeyPairAndCertificate, calculateCertificateFingerprints } from './utils.js';

describe('generateKeyPairAndCertificate', () => {
  it('should generate valid key pair and certificate', async () => {
    const result = await generateKeyPairAndCertificate(1);

    // Verify private key format
    expect(result.privateKey).toContain('-----BEGIN RSA PRIVATE KEY-----');
    expect(result.privateKey).toContain('-----END RSA PRIVATE KEY-----');

    // Verify certificate format
    expect(result.certificate).toContain('-----BEGIN CERTIFICATE-----');
    expect(result.certificate).toContain('-----END CERTIFICATE-----');

    // Verify expiration date (default 365 days)
    const expectedNotAfter = addDays(new Date(), 365);
    expect(result.notAfter.getDate()).toBe(expectedNotAfter.getDate());
    expect(result.notAfter.getMonth()).toBe(expectedNotAfter.getMonth());
    expect(result.notAfter.getFullYear()).toBe(expectedNotAfter.getFullYear());

    // Verify certificate content
    const cert = forge.pki.certificateFromPem(result.certificate);
    expect(cert.subject.getField('CN').value).toBe('example.com');
    expect(cert.issuer.getField('CN').value).toBe('logto.io');
    expect(cert.issuer.getField('O').value).toBe('Logto');
    expect(cert.issuer.getField('C').value).toBe('US');
  });

  it('should generate certificate with custom lifespan', async () => {
    const customYears = 30;
    const result = await generateKeyPairAndCertificate(customYears);

    const expectedNotAfter = addYears(new Date(), customYears);
    expect(result.notAfter.getDate()).toBe(expectedNotAfter.getDate());
    expect(result.notAfter.getMonth()).toBe(expectedNotAfter.getMonth());
    expect(result.notAfter.getFullYear()).toBe(expectedNotAfter.getFullYear());
  });

  it('should generate unique serial numbers for different certificates', async () => {
    const result1 = await generateKeyPairAndCertificate(1);
    const result2 = await generateKeyPairAndCertificate(1);

    const cert1 = forge.pki.certificateFromPem(result1.certificate);
    const cert2 = forge.pki.certificateFromPem(result2.certificate);

    expect(cert1.serialNumber).not.toBe(cert2.serialNumber);
  });

  it('should generate RSA key pair with 4096 bits', async () => {
    const result = await generateKeyPairAndCertificate(1);
    const privateKey = forge.pki.privateKeyFromPem(result.privateKey);

    // RSA key should be 4096 bits
    expect(forge.pki.privateKeyToPem(privateKey).length).toBeGreaterThan(3000); // A 4096-bit RSA private key in PEM format is typically longer than 3000 characters
  });
});

describe('calculateCertificateFingerprints', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let validCertificate: string;

  beforeAll(async () => {
    // Generate a valid certificate for testing
    const { certificate } = await generateKeyPairAndCertificate(1);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    validCertificate = certificate;
  });

  it('should calculate correct fingerprints for valid certificate', () => {
    const fingerprints = calculateCertificateFingerprints(validCertificate);

    // Verify fingerprints format
    expect(fingerprints.sha256.formatted).toMatch(/^([\dA-F]{2}:){31}[\dA-F]{2}$/);
    expect(fingerprints.sha256.unformatted).toMatch(/^[\dA-F]{64}$/);

    // Verify formatted and unformatted consistency
    expect(fingerprints.sha256.unformatted).toBe(fingerprints.sha256.formatted.replaceAll(':', ''));
  });

  it('should throw error for invalid PEM format', () => {
    const invalidCertificates = [
      'not a certificate',
      '-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----\n',
      // Missing begin/end markers
      'MIIFWjCCA0KgAwIBAgIUMDAwMDAwMDAwMDAwMDAwMDAwMDAwDQYJKoZIhvcNAQEL',
    ];

    for (const cert of invalidCertificates) {
      expect(() => calculateCertificateFingerprints(cert)).toThrow(
        new RequestError('application.saml.invalid_certificate_pem_format')
      );
    }
  });

  it('should throw error for invalid base64 content', () => {
    const invalidBase64Certificate =
      '-----BEGIN CERTIFICATE-----\n' +
      'This is not base64!@#$%^&*()\n' +
      '-----END CERTIFICATE-----\n';

    expect(() => calculateCertificateFingerprints(invalidBase64Certificate)).toThrow(
      new RequestError('application.saml.invalid_certificate_pem_format')
    );
  });

  it('should handle certificates with different line endings', () => {
    // Replace \n with \r\n in valid certificate
    const crlfCertificate = validCertificate.replaceAll('\n', '\r\n');

    const originalFingerprints = calculateCertificateFingerprints(validCertificate);
    const crlfFingerprints = calculateCertificateFingerprints(crlfCertificate);

    expect(crlfFingerprints).toEqual(originalFingerprints);
  });

  it('should calculate consistent fingerprints for the same certificate', () => {
    const firstResult = calculateCertificateFingerprints(validCertificate);
    const secondResult = calculateCertificateFingerprints(validCertificate);

    expect(firstResult).toEqual(secondResult);
  });
});
