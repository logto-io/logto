import { type SubjectToken } from '@logto/schemas';
import { type KoaContextWithOIDC, errors } from 'oidc-provider';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { TokenExchangeTokenType } from './types.js';

const { jest } = import.meta;

const mockJwtVerify = jest.fn();

jest.unstable_mockModule('jose', () => ({
  jwtVerify: mockJwtVerify,
}));

const { buildHandler } = await import('./index.js');

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = async () => {};
const findSubjectToken = jest.fn();
const updateSubjectTokenById = jest.fn();

const mockQueries = {
  subjectTokens: {
    findSubjectToken,
    updateSubjectTokenById,
  },
};
const mockTenant = new MockTenant(undefined, mockQueries);
const mockHandler = (tenant = mockTenant) => {
  return buildHandler(tenant.envSet, tenant.queries);
};

const clientId = 'some_client_id';
const subjectTokenId = 'some_token_id';
const accountId = 'some_account_id';

type Client = InstanceType<KoaContextWithOIDC['oidc']['provider']['Client']>;

// @ts-expect-error
const validClient: Client = {
  clientId,
  grantTypeAllowed: jest.fn().mockResolvedValue(true),
  clientAuthMethod: 'none',
};

const createValidSubjectToken = (): SubjectToken => ({
  id: subjectTokenId,
  userId: accountId,
  context: {},
  expiresAt: Date.now() + 3_600_000,
  consumedAt: null,
  tenantId: 'some_tenant_id',
  creatorId: 'some_creator_id',
  createdAt: Date.now(),
});

const validOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
  params: {
    // Using sub_ prefix for backward compatibility test - this should be treated as impersonation token
    subject_token: 'sub_some_subject_token',
    subject_token_type: TokenExchangeTokenType.AccessToken,
  },
  entities: {
    Client: validClient,
  },
  client: validClient,
};

const createPreparedContext = () => {
  const ctx = createOidcContext(validOidcContext);
  return ctx;
};

const createPreparedOrganizationContext = () => {
  const ctx = createOidcContext({
    ...validOidcContext,
    params: { ...validOidcContext.params, organization_id: 'some_org_id' },
  });
  return ctx;
};

const createAccessDeniedError = (message: string, statusCode: number) => {
  const error = new errors.AccessDenied(message);
  // eslint-disable-next-line @silverhand/fp/no-mutation
  error.statusCode = statusCode;
  return error;
};

beforeAll(() => {
  // `oidc-provider` will warn for dev interactions
  Sinon.stub(console, 'warn');
});

afterAll(() => {
  Sinon.restore();
});

describe('token exchange', () => {
  afterEach(() => {
    findSubjectToken.mockClear();
    updateSubjectTokenById.mockClear();
  });

  it('should throw when client is not available', async () => {
    const ctx = createOidcContext({ ...validOidcContext, client: undefined });
    await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidClient);
  });

  it('should throw when subject token type is incorrect', async () => {
    const ctx = createOidcContext({
      ...validOidcContext,
      params: { ...validOidcContext.params, subject_token_type: 'invalid' },
    });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('unsupported subject token type')
    );
  });

  it('should throw when subject token is not available', async () => {
    const ctx = createOidcContext(validOidcContext);
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('subject token not found')
    );
  });

  it('should throw when subject token is expired', async () => {
    const ctx = createOidcContext(validOidcContext);
    findSubjectToken.mockResolvedValueOnce({
      ...createValidSubjectToken(),
      expiresAt: Date.now() - 1000,
    });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('subject token is expired')
    );
  });

  it('should throw when subject token has been consumed', async () => {
    const ctx = createOidcContext(validOidcContext);
    findSubjectToken.mockResolvedValueOnce({
      ...createValidSubjectToken(),
      consumedAt: Date.now() - 1000,
    });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('subject token is already consumed')
    );
  });

  it('should throw when account cannot be found', async () => {
    const ctx = createOidcContext(validOidcContext);
    findSubjectToken.mockResolvedValueOnce(createValidSubjectToken());
    Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves();
    await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidGrant);
  });

  // The handler returns void so we cannot check the return value, and it's also not
  // straightforward to assert the token is issued correctly. Here we just do the sanity
  // check and basic token validation. Comprehensive token validation should be done in
  // integration tests.
  it('should not explode when everything looks fine', async () => {
    const ctx = createPreparedContext();
    findSubjectToken.mockResolvedValueOnce(createValidSubjectToken());
    Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    const noopStub = Sinon.stub().resolves();

    await expect(mockHandler(mockTenant)(ctx, noopStub)).resolves.toBeUndefined();
    expect(noopStub.callCount).toBe(1);
    expect(updateSubjectTokenById).toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      accountId,
      clientId,
      gty: 'urn:ietf:params:oauth:grant-type:token-exchange',
    });
  });

  describe('RFC 0001 organization token', () => {
    it('should throw if the user is not a member of the organization', async () => {
      const ctx = createPreparedOrganizationContext();
      findSubjectToken.mockResolvedValueOnce(createValidSubjectToken());
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

      const tenant = new MockTenant(undefined, mockQueries);
      Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(false);
      await expect(mockHandler(tenant)(ctx, noop)).rejects.toThrow(
        createAccessDeniedError('user is not a member of the organization', 403)
      );
    });

    it('should throw if the organization requires MFA but the user has not configured it', async () => {
      const ctx = createPreparedOrganizationContext();
      findSubjectToken.mockResolvedValueOnce(createValidSubjectToken());
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

      const tenant = new MockTenant(undefined, mockQueries);
      Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
      Sinon.stub(tenant.queries.organizations, 'getMfaStatus').resolves({
        isMfaRequired: true,
        hasMfaConfigured: false,
      });
      await expect(mockHandler(tenant)(ctx, noop)).rejects.toThrow(
        createAccessDeniedError('organization requires MFA but user has no MFA configured', 403)
      );
    });

    it('should not explode when everything looks fine', async () => {
      const ctx = createPreparedOrganizationContext();
      findSubjectToken.mockResolvedValueOnce(createValidSubjectToken());
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

      const tenant = new MockTenant(undefined, mockQueries);
      Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
      Sinon.stub(tenant.queries.organizations.relations.usersRoles, 'getUserScopes').resolves([
        { tenantId: 'default', id: 'foo', name: 'foo', description: 'foo' },
        { tenantId: 'default', id: 'bar', name: 'bar', description: 'bar' },
        { tenantId: 'default', id: 'baz', name: 'baz', description: 'baz' },
      ]);
      Sinon.stub(tenant.queries.organizations, 'getMfaStatus').resolves({
        isMfaRequired: false,
        hasMfaConfigured: false,
      });

      const entityStub = Sinon.stub(ctx.oidc, 'entity');
      const noopStub = Sinon.stub().resolves();

      await expect(mockHandler(tenant)(ctx, noopStub)).resolves.toBeUndefined();
      expect(noopStub.callCount).toBe(1);
      expect(updateSubjectTokenById).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [key, value] = entityStub.lastCall.args;
      expect(key).toBe('AccessToken');
      expect(value).toMatchObject({
        accountId,
        clientId,
        aud: 'urn:logto:organization:some_org_id',
      });
    });
  });

  describe('JWT access token exchange', () => {
    // Stub EnvSet.values to enable dev features for JWT access token exchange
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: true,
    });

    afterAll(() => {
      stub.restore();
    });

    const jwtOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
      params: {
        // JWT tokens don't start with sub_ prefix
        subject_token: 'some_jwt_token',
        subject_token_type: TokenExchangeTokenType.AccessToken,
      },
      entities: {
        Client: validClient,
      },
      client: validClient,
    };

    const createPreparedJwtContext = () => {
      const ctx = createOidcContext(jwtOidcContext);
      // Mock AccessToken.find to return undefined (so it falls back to JWT verification)
      Sinon.stub(ctx.oidc.provider.AccessToken, 'find').resolves();
      return ctx;
    };

    afterEach(() => {
      mockJwtVerify.mockClear();
    });

    it('should throw when JWT verification fails', async () => {
      const ctx = createPreparedJwtContext();
      mockJwtVerify.mockRejectedValueOnce(new Error('invalid signature'));
      await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
        new errors.InvalidGrant('invalid subject token')
      );
    });

    it('should throw when JWT does not contain sub claim', async () => {
      const ctx = createPreparedJwtContext();
      mockJwtVerify.mockResolvedValueOnce({ payload: {} });
      await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
        new errors.InvalidGrant('subject token does not contain a valid `sub` claim')
      );
    });

    it('should throw when account cannot be found', async () => {
      const ctx = createPreparedJwtContext();
      mockJwtVerify.mockResolvedValueOnce({ payload: { sub: accountId } });
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves();
      await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidGrant);
    });

    it('should not consume the token (allow multiple exchanges)', async () => {
      const ctx = createPreparedJwtContext();
      mockJwtVerify.mockResolvedValueOnce({ payload: { sub: accountId } });
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

      const entityStub = Sinon.stub(ctx.oidc, 'entity');
      const noopStub = Sinon.stub().resolves();

      await expect(mockHandler(mockTenant)(ctx, noopStub)).resolves.toBeUndefined();
      expect(noopStub.callCount).toBe(1);
      // JWT tokens should NOT be consumption-tracked
      expect(updateSubjectTokenById).not.toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [key, value] = entityStub.lastCall.args;
      expect(key).toBe('AccessToken');
      expect(value).toMatchObject({
        accountId,
        clientId,
        gty: 'urn:ietf:params:oauth:grant-type:token-exchange',
      });
    });
  });

  describe('opaque access token exchange', () => {
    // Stub EnvSet.values to enable dev features for access token exchange
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: true,
    });

    afterAll(() => {
      stub.restore();
    });

    const opaqueOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
      params: {
        subject_token: 'opaque_access_token',
        subject_token_type: TokenExchangeTokenType.AccessToken,
      },
      entities: {
        Client: validClient,
      },
      client: validClient,
    };

    const createPreparedOpaqueContext = () => {
      const ctx = createOidcContext(opaqueOidcContext);
      return ctx;
    };

    it('should exchange opaque access token successfully', async () => {
      const ctx = createPreparedOpaqueContext();
      // Mock AccessToken.find to return a valid token
      Sinon.stub(ctx.oidc.provider.AccessToken, 'find').resolves({
        accountId,
        isExpired: false,
      });
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

      const entityStub = Sinon.stub(ctx.oidc, 'entity');
      const noopStub = Sinon.stub().resolves();

      await expect(mockHandler(mockTenant)(ctx, noopStub)).resolves.toBeUndefined();
      expect(noopStub.callCount).toBe(1);
      // Opaque tokens should NOT be consumption-tracked
      expect(updateSubjectTokenById).not.toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [key, value] = entityStub.lastCall.args;
      expect(key).toBe('AccessToken');
      expect(value).toMatchObject({
        accountId,
        clientId,
        gty: 'urn:ietf:params:oauth:grant-type:token-exchange',
      });
    });

    it('should throw when opaque token is expired', async () => {
      const ctx = createPreparedOpaqueContext();
      Sinon.stub(ctx.oidc.provider.AccessToken, 'find').resolves({
        accountId,
        isExpired: true,
      });

      await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
        new errors.InvalidGrant('subject token is expired')
      );
    });

    it('should fallback to JWT when opaque token is not found', async () => {
      const ctx = createPreparedOpaqueContext();
      // Mock AccessToken.find to return undefined (not found)
      Sinon.stub(ctx.oidc.provider.AccessToken, 'find').resolves();
      // Mock jwtVerify to succeed
      mockJwtVerify.mockResolvedValueOnce({ payload: { sub: accountId } });
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

      const entityStub = Sinon.stub(ctx.oidc, 'entity');
      const noopStub = Sinon.stub().resolves();

      await expect(mockHandler(mockTenant)(ctx, noopStub)).resolves.toBeUndefined();
      expect(noopStub.callCount).toBe(1);
      expect(mockJwtVerify).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [key, value] = entityStub.lastCall.args;
      expect(key).toBe('AccessToken');
      expect(value).toMatchObject({
        accountId,
        clientId,
        gty: 'urn:ietf:params:oauth:grant-type:token-exchange',
      });
    });
  });

  describe('impersonation token with explicit type', () => {
    const impersonationOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
      params: {
        subject_token: 'sub_impersonation_token',
        subject_token_type: TokenExchangeTokenType.ImpersonationToken,
      },
      entities: {
        Client: validClient,
      },
      client: validClient,
    };

    const createPreparedImpersonationContext = () => {
      const ctx = createOidcContext(impersonationOidcContext);
      return ctx;
    };

    it('should validate impersonation token with explicit type', async () => {
      const ctx = createPreparedImpersonationContext();
      findSubjectToken.mockResolvedValueOnce(createValidSubjectToken());
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

      const entityStub = Sinon.stub(ctx.oidc, 'entity');
      const noopStub = Sinon.stub().resolves();

      await expect(mockHandler(mockTenant)(ctx, noopStub)).resolves.toBeUndefined();
      expect(noopStub.callCount).toBe(1);
      expect(updateSubjectTokenById).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [key, value] = entityStub.lastCall.args;
      expect(key).toBe('AccessToken');
      expect(value).toMatchObject({
        accountId,
        clientId,
        gty: 'urn:ietf:params:oauth:grant-type:token-exchange',
      });
    });
  });
});
