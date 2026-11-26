import { UserScope } from '@logto/core-kit';
import { type MfaFactor, type Organization } from '@logto/schemas';
import { type Adapter, type KoaContextWithOIDC, errors } from 'oidc-provider';
import Sinon from 'sinon';

import { mockSignInExperience, mockUser } from '#src/__mocks__/index.js';
import { getProviderConfiguration } from '#src/oidc/oidc-provider-internals.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { buildHandler } from './refresh-token.js';

const { jest } = import.meta;

export const assertUserHasApplicationAccess = jest.fn(async () => {
  await Promise.resolve();
});

export const mockHandler = (tenant = new MockTenant()) => {
  return buildHandler(tenant.envSet, tenant.queries, {
    applicationAccessControl: { assertUserHasApplicationAccess },
    applications: tenant.libraries.applications,
  });
};

/**
 * Stub the MFA requirement of the organization. With `factors`, the organization requires MFA, the
 * sign-in experience enables `factors`, and the user has only the primary email and phone of
 * `mockUser`, with no stored MFA verification.
 */
export const stubOrganizationMfa = (tenant: MockTenant, factors?: MfaFactor[]) => {
  Sinon.stub(tenant.queries.organizations, 'findById').resolves({
    isMfaRequired: Boolean(factors),
  } as Organization);

  if (factors) {
    Sinon.stub(tenant.queries.signInExperiences, 'findDefaultSignInExperience').resolves({
      ...mockSignInExperience,
      mfa: { ...mockSignInExperience.mfa, factors },
    });
    Sinon.stub(tenant.queries.users, 'findUserById').resolves({
      ...mockUser,
      mfaVerifications: [],
    });
  }
};

export const clientId = 'some_client_id';
export const grantId = 'some_grant_id';
export const accountId = 'some_account_id';
export const requestScopes = ['foo', 'bar'];

const mockAdapter: Adapter = {
  upsert: jest.fn(),
  find: jest.fn(),
  findByUserCode: jest.fn(),
  findByUid: jest.fn(),
  consume: jest.fn(),
  destroy: jest.fn(),
  revokeByGrantId: jest.fn(),
};

type RefreshToken = InstanceType<KoaContextWithOIDC['oidc']['provider']['RefreshToken']>;
export type Grant = InstanceType<KoaContextWithOIDC['oidc']['provider']['Grant']>;
export type Client = InstanceType<KoaContextWithOIDC['oidc']['provider']['Client']>;

export const validClient: Client = {
  clientId,
  grantTypeAllowed: jest.fn().mockResolvedValue(true),
  clientAuthMethod: 'none',
  metadata: jest.fn(() => ({ client_id: clientId, appLevelAccessControlEnabled: false })),
} as unknown as Client;

export const validRefreshToken: RefreshToken = {
  kind: 'RefreshToken',
  clientId,
  grantId,
  accountId,
  consumed: undefined,
  totalLifetime: jest.fn().mockReturnValue(1),
  isSenderConstrained: jest.fn().mockReturnValue(false),
  consume: jest.fn(),
  iat: 0,
  jti: '',
  scope: [UserScope.Organizations, ...requestScopes].join(' '),
  scopes: new Set([UserScope.Organizations, ...requestScopes]),
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

export const stubRefreshToken = (ctx: KoaContextWithOIDC, overrides?: Partial<RefreshToken>) => {
  return Sinon.stub(ctx.oidc.provider.RefreshToken, 'find').resolves({
    ...validRefreshToken,
    ...overrides,
  });
};

export const validOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
  requestParamScopes: new Set(requestScopes),
  params: {
    refresh_token: 'some_refresh_token',
    organization_id: 'some_org_id',
    scope: requestScopes.join(' '),
  },
  entities: {
    RefreshToken: validRefreshToken,
    Client: validClient,
  },
  client: validClient,
};

export const validGrant: Grant = {
  jti: '',
  kind: '',
  iat: 0,
  clientId,
  accountId,
  scopes: new Set<string>(),
  ttlPercentagePassed: jest.fn(),
  isValid: false,
  isExpired: false,
  remainingTTL: 0,
  expiration: 0,
  adapter: mockAdapter,
  addOIDCScope: jest.fn(),
  rejectOIDCScope: jest.fn(),
  getOIDCScope: jest.fn(),
  getOIDCScopeEncountered: jest.fn(),
  getOIDCScopeFiltered: jest.fn(),
  addOIDCClaims: jest.fn(),
  rejectOIDCClaims: jest.fn(),
  getOIDCClaims: jest.fn(),
  getOIDCClaimsEncountered: jest.fn(),
  getOIDCClaimsFiltered: jest.fn(),
  addResourceScope: jest.fn(),
  rejectResourceScope: jest.fn(),
  getResourceScope: jest.fn(),
  getResourceScopeEncountered: jest.fn(),
  getResourceScopeFiltered: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
  emit: jest.fn(),
};

export const stubGrant = (
  ctx: KoaContextWithOIDC,
  overrides?: Partial<Grant> & Record<string, unknown>
) => {
  return Sinon.stub(ctx.oidc.provider.Grant, 'find').resolves({
    ...validGrant,
    ...overrides,
  });
};

export const stubAccount = (ctx: KoaContextWithOIDC, overrideAccountId = accountId) => {
  return Sinon.stub(getProviderConfiguration(ctx.oidc.provider), 'findAccount').resolves({
    accountId: overrideAccountId,
  });
};

/** The real `IdToken` constructor rejects the mocked plain-object client. */
class StubIdToken {
  scope?: string;
  mask?: unknown;
  rejected?: unknown;
  set = jest.fn();
  issue = jest.fn().mockResolvedValue('stub_id_token');
}

export const stubIdToken = (ctx: KoaContextWithOIDC) =>
  Sinon.stub(ctx.oidc.provider, 'IdToken').value(StubIdToken);

export const createAccessDeniedError = (message: string, statusCode: number) => {
  const error = new errors.AccessDenied(message);
  // eslint-disable-next-line @silverhand/fp/no-mutation -- oidc-provider errors take the HTTP status by assignment after construction
  error.statusCode = statusCode;
  return error;
};

export const createPreparedContext = () => {
  const ctx = createOidcContext(validOidcContext);
  stubRefreshToken(ctx);
  stubGrant(ctx);
  stubAccount(ctx);
  return ctx;
};
