import { BindingType, NameIdFormat } from '@logto/schemas';
import { createLocalJWKSet } from 'jose';

import { mockApplication } from '#src/__mocks__/index.js';
import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import { type SamlApplicationDetails } from '#src/queries/saml-application/index.js';

export const createMockSamlApplicationDetails = (
  overrides: Partial<SamlApplicationDetails> = {}
): SamlApplicationDetails => ({
  ...mockApplication,
  entityId: 'sp-entity-id',
  acsUrl: { binding: BindingType.Post, url: 'https://sp.example.com/acs' },
  oidcClientMetadata: { redirectUris: ['https://logto.test/callback'], postLogoutRedirectUris: [] },
  privateKey: 'mock-private-key',
  certificate: 'mock-certificate',
  secret: 'mock-secret',
  nameIdFormat: NameIdFormat.Persistent,
  attributeMapping: {},
  encryption: null,
  active: true,
  expiresAt: null,
  ...overrides,
});

export const createMockSamlEnvSet = (oidc: Partial<EnvSet['oidc']> = {}) => {
  const envSet = new EnvSet('tenant-id', EnvSet.values.dbUrl);
  import.meta.jest
    .spyOn(envSet, 'endpoint', 'get')
    .mockReturnValue(getTenantEndpoint('tenant-id', EnvSet.values));
  import.meta.jest.spyOn(envSet, 'oidc', 'get').mockReturnValue({
    issuer: 'https://issuer.example.com',
    cookieKeys: [],
    privateJwks: [],
    publicJwks: [],
    localJWKSet: createLocalJWKSet({ keys: [] }),
    jwkSigningAlg: 'ES256',
    sessionTtl: 3600,
    cimdEnabled: false,
    ...oidc,
  });
  return envSet;
};
