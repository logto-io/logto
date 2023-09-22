import { generateSamlKeyPair } from './saml.js';

describe('SAML utils', () => {
  it('should generate SAML key pair', async () => {
    const { privateKey, publicCert } = generateSamlKeyPair();

    expect(privateKey).toBeDefined();
    expect(publicCert).toBeDefined();

    // Should contains header
    expect(privateKey).toContain('-----BEGIN RSA PRIVATE KEY-----');
    expect(publicCert).toContain('-----BEGIN CERTIFICATE-----');
  });
});
