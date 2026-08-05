import { createMockUtils } from '@logto/shared/esm';

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

const buildEnvSet = (cimdEnabled: boolean): EnvSet => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the field the module reads
  return { oidc: { cimdEnabled } } as EnvSet;
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
    expect(buildClientIdMetadataDocumentFeature(buildEnvSet(true))).toEqual({
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
