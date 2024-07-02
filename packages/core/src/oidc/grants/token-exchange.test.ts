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

const mockTenant = new MockTenant(undefined, {
  subjectTokens: {
    findSubjectToken,
    updateSubjectTokenById,
  },
  applications: {
    findApplicationById,
  },
});
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
});
