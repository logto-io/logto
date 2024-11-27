import { addDays } from 'date-fns';
import forge from 'node-forge';

import { generateKeyPairAndCertificate } from './utils.js';

describe('generateKeyPairAndCertificate', () => {
  it('should generate valid key pair and certificate', async () => {
    const result = await generateKeyPairAndCertificate();

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
    const customDays = 30;
    const result = await generateKeyPairAndCertificate(customDays);

    const expectedNotAfter = addDays(new Date(), customDays);
    expect(result.notAfter.getDate()).toBe(expectedNotAfter.getDate());
    expect(result.notAfter.getMonth()).toBe(expectedNotAfter.getMonth());
    expect(result.notAfter.getFullYear()).toBe(expectedNotAfter.getFullYear());
  });

  it('should generate unique serial numbers for different certificates', async () => {
    const result1 = await generateKeyPairAndCertificate();
    const result2 = await generateKeyPairAndCertificate();

    const cert1 = forge.pki.certificateFromPem(result1.certificate);
    const cert2 = forge.pki.certificateFromPem(result2.certificate);

    expect(cert1.serialNumber).not.toBe(cert2.serialNumber);
  });

  it('should generate RSA key pair with 4096 bits', async () => {
    const result = await generateKeyPairAndCertificate();
    const privateKey = forge.pki.privateKeyFromPem(result.privateKey);

    // RSA key should be 4096 bits
    expect(forge.pki.privateKeyToPem(privateKey).length).toBeGreaterThan(3000); // A 4096-bit RSA private key in PEM format is typically longer than 3000 characters
  });
});
