import { type SubjectToken } from '@logto/schemas';
import { type KoaContextWithOIDC, errors } from 'oidc-provider';
import Sinon from 'sinon';

import { mockApplication } from '#src/__mocks__/index.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { buildHandler } from './token-exchange.js';

const { jest } = import.meta;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = async () => {};
const findSubjectToken = jest.fn();
const updateSubjectTokenById = jest.fn();
const findApplicationById = jest.fn().mockResolvedValue(mockApplication);

const mockQueries = {
  subjectTokens: {
    findSubjectToken,
    updateSubjectTokenById,
  },
  applications: {
    findApplicationById,
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

const validSubjectToken: SubjectToken = {
  id: subjectTokenId,
  userId: accountId,
  context: {},
  expiresAt: Date.now() + 1000,
  consumedAt: null,
  tenantId: 'some_tenant_id',
  creatorId: 'some_creator_id',
  createdAt: Date.now(),
};

const validOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
  params: {
    subject_token: 'some_subject_token',
    subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
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
    findApplicationById.mockClear();
  });

  it('should throw when client is not available', async () => {
    const ctx = createOidcContext({ ...validOidcContext, client: undefined });
    await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidClient);
  });

  it('should throw when client is third-party application', async () => {
    findApplicationById.mockResolvedValueOnce({ ...mockApplication, isThirdParty: true });
    const ctx = createOidcContext(validOidcContext);
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
    findSubjectToken.mockResolvedValueOnce({ ...validSubjectToken, expiresAt: Date.now() - 1000 });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('subject token is expired')
    );
  });

  it('should throw when subject token has been consumed', async () => {
    const ctx = createOidcContext(validOidcContext);
    findSubjectToken.mockResolvedValueOnce({ ...validSubjectToken, consumedAt: Date.now() - 1000 });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('subject token is already consumed')
    );
  });

  it('should throw when account cannot be found', async () => {
    const ctx = createOidcContext(validOidcContext);
    findSubjectToken.mockResolvedValueOnce(validSubjectToken);
    Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves();
    await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidGrant);
  });

  // The handler returns void so we cannot check the return value, and it's also not
  // straightforward to assert the token is issued correctly. Here we just do the sanity
  // check and basic token validation. Comprehensive token validation should be done in
  // integration tests.
  it('should not explode when everything looks fine', async () => {
    const ctx = createPreparedContext();
    findSubjectToken.mockResolvedValueOnce(validSubjectToken);
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
      grantId: subjectTokenId,
      gty: 'urn:ietf:params:oauth:grant-type:token-exchange',
    });
  });

  describe('RFC 0001 organization token', () => {
    it('should throw if the user is not a member of the organization', async () => {
      const ctx = createPreparedOrganizationContext();
      findSubjectToken.mockResolvedValueOnce(validSubjectToken);
      Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({ accountId });

      const tenant = new MockTenant(undefined, mockQueries);
      Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(false);
      await expect(mockHandler(tenant)(ctx, noop)).rejects.toThrow(
        createAccessDeniedError('user is not a member of the organization', 403)
      );
    });

    it('should throw if the organization requires MFA but the user has not configured it', async () => {
      const ctx = createPreparedOrganizationContext();
      findSubjectToken.mockResolvedValueOnce(validSubjectToken);
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
      findSubjectToken.mockResolvedValueOnce(validSubjectToken);
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
        grantId: subjectTokenId,
        aud: 'urn:logto:organization:some_org_id',
      });
    });
  });
});
