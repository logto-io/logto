import { samlConnectorConfigGuard, SamlAuthnRequestSignatureAlgorithm } from './saml.js';

describe('samlConnectorConfigGuard backward compatibility', () => {
  // Every pre-existing config shape must still parse, and the newly-added optional signing
  // fields must be absent (not defaulted/injected) so stored configs are unchanged.
  it.each([
    { case: 'metadata URL', config: { metadataUrl: 'https://idp.example.com/metadata' } },
    {
      case: 'metadata URL with attribute mapping',
      config: {
        metadataUrl: 'https://idp.example.com/metadata',
        attributeMapping: { id: 'nameID', email: 'email' },
      },
    },
    { case: 'metadata XML', config: { metadata: '<EntityDescriptor/>' } },
    {
      case: 'manual metadata',
      config: {
        entityId: 'urn:idp.example.com',
        signInEndpoint: 'https://idp.example.com/sso',
        x509Certificate: 'MIID-cert',
      },
    },
    {
      case: 'manual metadata with attribute mapping',
      config: {
        entityId: 'urn:idp.example.com',
        signInEndpoint: 'https://idp.example.com/sso',
        x509Certificate: 'MIID-cert',
        attributeMapping: { name: 'displayName' },
      },
    },
  ])('parses an existing $case config with the signing fields absent', ({ config }) => {
    const result = samlConnectorConfigGuard.safeParse(config);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject(config);
      expect('signAuthnRequest' in result.data).toBe(false);
      expect('requestSignatureAlgorithm' in result.data).toBe(false);
    }
  });
});

describe('samlConnectorConfigGuard signing fields', () => {
  const baseConfigByShape = {
    'metadata URL': { metadataUrl: 'https://idp.example.com/metadata' },
    'metadata XML': { metadata: '<EntityDescriptor/>' },
    manual: {
      entityId: 'urn:idp.example.com',
      signInEndpoint: 'https://idp.example.com/sso',
      x509Certificate: 'MIID-cert',
    },
  };

  // Exercise every config shape so a dropped `.merge(samlSigningConfigGuard)` on any union branch
  // is caught (not just the metadata-URL branch).
  it.each(Object.entries(baseConfigByShape))(
    'accepts and preserves the signing fields on the %s shape',
    (_shape, base) => {
      const result = samlConnectorConfigGuard.safeParse({
        ...base,
        signAuthnRequest: true,
        requestSignatureAlgorithm: SamlAuthnRequestSignatureAlgorithm.RsaSha512,
      });

      expect(result.success).toBe(true);
      // The fields must be part of the schema, not stripped away as unknown keys.
      if (result.success) {
        expect(result.data).toMatchObject({
          signAuthnRequest: true,
          requestSignatureAlgorithm: SamlAuthnRequestSignatureAlgorithm.RsaSha512,
        });
      }
    }
  );

  it.each([
    SamlAuthnRequestSignatureAlgorithm.RsaSha256,
    SamlAuthnRequestSignatureAlgorithm.RsaSha512,
  ])('accepts the supported algorithm %s', (requestSignatureAlgorithm) => {
    const result = samlConnectorConfigGuard.safeParse({
      metadataUrl: 'https://idp.example.com/metadata',
      signAuthnRequest: true,
      requestSignatureAlgorithm,
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid signature algorithm', () => {
    const result = samlConnectorConfigGuard.safeParse({
      metadata: '<EntityDescriptor/>',
      signAuthnRequest: true,
      requestSignatureAlgorithm: 'not-a-real-alg',
    });

    expect(result.success).toBe(false);
  });
});
