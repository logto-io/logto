import { isKeyInObject } from '@silverhand/essentials';
import { type KoaContextWithOIDC, errors, type Adapter } from 'oidc-provider';

import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

jest.unstable_mockModule('#src/oidc/oidc-provider-internals.js', () => ({
  applyDpopBinding: jest.fn(),
  certificateThumbprint: jest.fn(),
  checkDpopRequired: jest.fn(),
  checkMtlsCert: jest.fn(),
  checkResource: jest.fn(),
  dpopValidate: jest.fn(),
  epochTime: jest.fn(),
  getProviderConfiguration: jest.fn().mockReturnValue({
    features: {
      mTLS: { getCertificate: jest.fn() },
      dPoP: { allowReplay: false },
    },
    scopes: new Set(['foo', 'bar']),
  }),
}));

const clientId = 'some_client_id';
const requestScopes = ['foo', 'bar'];

const mockAdapter: Adapter = {
  upsert: jest.fn(),
  find: jest.fn(),
  findByUserCode: jest.fn(),
  findByUid: jest.fn(),
  consume: jest.fn(),
  destroy: jest.fn(),
  revokeByGrantId: jest.fn(),
};

type ClientCredentials = InstanceType<KoaContextWithOIDC['oidc']['provider']['ClientCredentials']>;
type Client = InstanceType<KoaContextWithOIDC['oidc']['provider']['Client']>;

const validClientCredentials: ClientCredentials = {
  kind: 'ClientCredentials',
  clientId,
  aud: '',
  tokenType: '',
  isSenderConstrained: jest.fn().mockReturnValue(false),
  iat: 0,
  jti: '',
  scope: requestScopes.join(' '),
  scopes: new Set(requestScopes),
  ttlPercentagePassed: jest.fn(),
  isValid: false,
  isExpired: false,
  remainingTTL: 0,
  expiration: 0,
  save: jest.fn(),
  adapter: mockAdapter,
  destroy: jest.fn(),
  emit: jest.fn(),
};

// @ts-expect-error
const createValidClient = ({ scope }: { scope?: string } = {}): Client => ({
  clientId,
  grantTypeAllowed: jest.fn().mockResolvedValue(true),
  clientAuthMethod: 'none',
  scope,
});

const validOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
  params: {
    refresh_token: 'some_refresh_token',
    organization_id: 'some_org_id',
    scope: requestScopes.join(' '),
  },
  client: createValidClient(),
};

const { buildHandler } = await import('./client-credentials.js');

const mockHandler = (tenant = new MockTenant()) => {
  return buildHandler(tenant.envSet, tenant.queries);
};

// The handler returns void so we cannot check the return value, and it's also not
// straightforward to assert the token is issued correctly. Here we just do the sanity
// check and basic token validation. Comprehensive token validation should be done in
// integration tests.
describe('client credentials grant', () => {
  it('should throw an error if the client is not available', async () => {
    const ctx = createOidcContext({ ...validOidcContext, client: undefined });
    await expect(mockHandler()(ctx)).rejects.toThrow(errors.InvalidClient);
  });

  it('should throw an error if authorization_details is provided', async () => {
    const ctx = createOidcContext({
      ...validOidcContext,
      params: { ...validOidcContext.params, authorization_details: [{ type: 'foo' }] },
    });
    await expect(mockHandler()(ctx)).rejects.toThrow(errors.InvalidRequest);
  });

  it('should throw an error if the requested scope is not allowed', async () => {
    const ctx = createOidcContext({
      ...validOidcContext,
      client: createValidClient({ scope: 'baz' }),
    });
    await expect(
      mockHandler(
        new MockTenant(undefined, {
          organizations: {
            relations: {
              // @ts-expect-error
              apps: {
                exists: jest.fn().mockResolvedValue(true),
              },
            },
          },
        })
      )(ctx)
    ).rejects.toThrow(errors.InvalidScope);
  });

  it('should throw an error if the app has not associated with the organization', async () => {
    const ctx = createOidcContext(validOidcContext);
    await expect(
      mockHandler(
        new MockTenant(undefined, {
          organizations: {
            relations: {
              // @ts-expect-error
              apps: {
                exists: jest.fn().mockResolvedValue(false),
              },
            },
          },
        })
      )(ctx)
    ).rejects.toThrow(errors.AccessDenied);
  });

  it('should be ok', async () => {
    const ctx = createOidcContext(validOidcContext);
    await expect(
      mockHandler(
        new MockTenant(undefined, {
          organizations: {
            relations: {
              // @ts-expect-error
              apps: {
                exists: jest.fn().mockResolvedValue(true),
              },
              // @ts-expect-error
              appsRoles: { getApplicationScopes: jest.fn().mockResolvedValue([{ name: 'foo' }]) },
            },
          },
        })
      )(ctx)
    ).resolves.toBeUndefined();

    expect(isKeyInObject(ctx.body, 'scope') && ctx.body.scope).toBe('foo');
  });
});
