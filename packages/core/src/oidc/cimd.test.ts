import { createMockUtils } from '@logto/shared/esm';
import { type Client } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const loadCimdModule = async ({
  isDevFeaturesEnabled = true,
  isOidcProviderSsrfProtectionEnabled = true,
} = {}) => {
  jest.resetModules();
  mockEsm('#src/env-set/index.js', () => ({
    EnvSet: {
      values: { isDevFeaturesEnabled, isOidcProviderSsrfProtectionEnabled },
    },
  }));

  return import('./cimd.js');
};

const buildEnvSet = (cimdEnabled: boolean, jwkSigningAlg?: 'ES256' | 'ES384' | 'ES512'): EnvSet => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the fields the module reads
  return { oidc: { cimdEnabled, jwkSigningAlg } } as EnvSet;
};

const cimdClientIdMaxLength = 2048;

const buildClientId = (length: number) =>
  `https://example.com/${'a'.repeat(length - 'https://example.com/'.length)}`;

const buildClient = (clientId: string, idTokenSignedResponseAlg?: string): Client => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub scoped to the fields the hook reads
  return { clientId, idTokenSignedResponseAlg } as Client;
};

const loadEnabledFeature = async (jwkSigningAlg?: 'ES256' | 'ES384' | 'ES512') => {
  const { buildClientIdMetadataDocumentFeature } = await loadCimdModule();
  const feature = buildClientIdMetadataDocumentFeature(buildEnvSet(true, jwkSigningAlg));

  if (!feature) {
    throw new Error('Expected the CIMD feature to be built');
  }

  return feature.clientIdMetadataDocument;
};

describe('isCimdEffectivelyEnabled', () => {
  it('is enabled only when all three conditions hold', async () => {
    const { isCimdEffectivelyEnabled } = await loadCimdModule();
    expect(isCimdEffectivelyEnabled(buildEnvSet(true))).toBe(true);
  });

  it('is disabled when the dev features flag is off', async () => {
    const { isCimdEffectivelyEnabled } = await loadCimdModule({ isDevFeaturesEnabled: false });
    expect(isCimdEffectivelyEnabled(buildEnvSet(true))).toBe(false);
  });

  it('is disabled when the tenant config is off', async () => {
    const { isCimdEffectivelyEnabled } = await loadCimdModule();
    expect(isCimdEffectivelyEnabled(buildEnvSet(false))).toBe(false);
  });

  it('is disabled when the provider SSRF protection is off, regardless of the stored config', async () => {
    const { isCimdEffectivelyEnabled } = await loadCimdModule({
      isOidcProviderSsrfProtectionEnabled: false,
    });
    expect(isCimdEffectivelyEnabled(buildEnvSet(true))).toBe(false);
  });
});

describe('buildClientIdMetadataDocumentFeature', () => {
  it('wires the feature with the draft-02 acknowledgement when effectively enabled', async () => {
    const { buildClientIdMetadataDocumentFeature } = await loadCimdModule();
    expect(buildClientIdMetadataDocumentFeature(buildEnvSet(true))).toMatchObject({
      clientIdMetadataDocument: { enabled: true, ack: 'draft-02' },
    });
  });

  it('does not wire the feature at all when the dev features flag is off', async () => {
    const { buildClientIdMetadataDocumentFeature } = await loadCimdModule({
      isDevFeaturesEnabled: false,
    });
    expect(buildClientIdMetadataDocumentFeature(buildEnvSet(true))).toBeUndefined();
  });

  it('does not wire the feature when not effectively enabled', async () => {
    const { buildClientIdMetadataDocumentFeature } = await loadCimdModule();
    expect(buildClientIdMetadataDocumentFeature(buildEnvSet(false))).toBeUndefined();
  });
});

describe('isCimdClientId', () => {
  it('matches the fork scheme test case-insensitively and never matches registered ids', async () => {
    const { isCimdClientId } = await loadCimdModule();

    expect(isCimdClientId('https://client.example.com/metadata.json')).toBe(true);
    expect(isCimdClientId('HTTPS://client.example.com/metadata.json')).toBe(true);
    expect(isCimdClientId('registered_client_id')).toBe(false);
  });
});

describe('client identifier length bound', () => {
  it('allowFetch accepts an identifier at the bound and rejects one past it', async () => {
    const { allowFetch } = await loadEnabledFeature();
    expect(allowFetch(undefined, buildClientId(cimdClientIdMaxLength))).toBe(true);
    expect(allowFetch(undefined, buildClientId(cimdClientIdMaxLength + 1))).toBe(false);
  });

  it('allowClient accepts a client at the bound and rejects one past it', async () => {
    const { allowClient } = await loadEnabledFeature();
    expect(allowClient(undefined, buildClient(buildClientId(cimdClientIdMaxLength)))).toBe(true);
    expect(allowClient(undefined, buildClient(buildClientId(cimdClientIdMaxLength + 1)))).toBe(
      false
    );
  });
});

describe('ID token signing algorithm guard', () => {
  const clientId = buildClientId(64);

  it('allowClient accepts the tenant signing algorithm and an omitted declaration on an EC tenant', async () => {
    const { allowClient } = await loadEnabledFeature('ES384');
    expect(allowClient(undefined, buildClient(clientId, 'ES384'))).toBe(true);
    expect(allowClient(undefined, buildClient(clientId))).toBe(true);
  });

  it('allowClient rejects a declaration the EC tenant signing key cannot sign', async () => {
    const { allowClient } = await loadEnabledFeature('ES384');

    /**
     * `jest.resetModules` gives cimd.js its own `oidc-provider` module instance, so class
     * identity assertions would fail; the thrown error also keeps the OIDC error code in
     * `message` and the human-readable text in `error_description`.
     */
    const thrown = ((): unknown => {
      try {
        return allowClient(undefined, buildClient(clientId, 'RS256'));
      } catch (error) {
        return error;
      }
    })();

    expect(thrown).toMatchObject({
      message: 'invalid_client_metadata',
      error_description:
        'id_token_signed_response_alg RS256 cannot be signed with the tenant signing key',
    });
  });

  it('allowClient does not guard the algorithm when the tenant key derives none', async () => {
    const { allowClient } = await loadEnabledFeature();
    expect(allowClient(undefined, buildClient(clientId, 'RS256'))).toBe(true);
    expect(allowClient(undefined, buildClient(clientId, 'ES384'))).toBe(true);
  });
});
