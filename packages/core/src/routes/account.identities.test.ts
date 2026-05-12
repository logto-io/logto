import { ConnectorType } from '@logto/connector-kit';
import { UserScope } from '@logto/core-kit';
import {
  AccountCenterControlValue,
  type CreateUser,
  type User,
  VerificationType,
} from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { mockUser } from '#src/__mocks__/user.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { getUserIdentifierCount } from '#src/utils/user.js';

import identitiesRoutes from './account/identities.js';
import type { UserRouter } from './types.js';

const { jest } = import.meta;

const buildUser = () => ({
  ...mockUser,
  username: null,
  primaryEmail: null,
  primaryPhone: null,
  passwordEncrypted: null,
  passwordEncryptionMethod: null,
  identities: { github: { userId: 'github-user', details: {} } },
  mfaVerifications: [],
});

const createAccountIdentitiesRequester = (socialUserInfoId = 'new-github-user') => {
  const findActiveVerificationRecordById = jest.fn(async (id: string) => ({
    id,
    userId: null,
    data: {
      type: VerificationType.Social,
      connectorId: 'github',
      socialUserInfo: { id: socialUserInfoId },
    },
    expiresAt: Date.now() + 60_000,
  }));
  const findUserById = jest.fn(async () => buildUser());
  const updateUserById = jest.fn(
    async (_userId: string, data: Partial<CreateUser>): Promise<User> => ({
      ...mockUser,
      ...data,
    })
  );
  const deleteSocialTokenSetSecretByUserIdAndTarget = jest.fn();
  const upsertSocialTokenSetSecret = jest.fn();
  const checkIdentifierCollision = jest.fn();
  const getConnector = jest.fn(async () => ({
    type: ConnectorType.Social,
    metadata: {
      id: 'github',
      target: 'github',
    },
  }));

  const tenantContext = new MockTenant(
    undefined,
    {
      users: { findUserById, updateUserById },
      verificationRecords: { findActiveVerificationRecordById },
      secrets: { deleteSocialTokenSetSecretByUserIdAndTarget },
    } as unknown as Partial2<Queries>,
    undefined,
    {
      users: { checkIdentifierCollision },
      socials: { getConnector, upsertSocialTokenSetSecret },
    } as unknown as Partial2<Libraries>
  );

  const app = new Koa();
  const router: UserRouter = new Router();

  router.use(async (ctx, next) => {
    ctx.auth = {
      type: 'user',
      id: 'foo',
      scopes: new Set([UserScope.Identities]),
      identityVerified: true,
    };
    ctx.accountCenter = {
      fields: {
        social: AccountCenterControlValue.Edit,
      },
    } as unknown as typeof ctx.accountCenter;
    ctx.appendDataHookContext = jest.fn();

    return next();
  });
  identitiesRoutes(router, tenantContext);
  app.use(router.routes()).use(router.allowedMethods());

  return {
    accountIdentitiesRequest: request(app.callback()),
    deleteSocialTokenSetSecretByUserIdAndTarget,
    upsertSocialTokenSetSecret,
  };
};

describe('account social identity unlink guard', () => {
  it('counts the remaining social identity as an identifier', () => {
    expect(getUserIdentifierCount(buildUser())).toBe(1);
  });

  it('counts primary identifiers and social identities together', () => {
    const user = {
      ...buildUser(),
      username: 'user',
      primaryEmail: 'foo@example.com',
      primaryPhone: '123456789',
      identities: {
        custom_social: { userId: 'custom-social-user', details: {} },
        github: { userId: 'github-user', details: {} },
      },
    };

    expect(getUserIdentifierCount(user)).toBe(5);
  });

  it('does not count password or mfa as identifiers', () => {
    const user = {
      ...buildUser(),
      passwordEncrypted: 'encrypted',
      passwordEncryptionMethod: mockUser.passwordEncryptionMethod,
      mfaVerifications: mockUser.mfaVerifications,
    };

    expect(getUserIdentifierCount(user)).toBe(1);
  });

  it('counts enterprise SSO identities as identifiers', () => {
    expect(getUserIdentifierCount(buildUser(), 2)).toBe(3);
  });
});

describe('account social identity replacement', () => {
  it('clears the stored token secret when replacing with a different social user and the verification has no tokens', async () => {
    const {
      accountIdentitiesRequest,
      deleteSocialTokenSetSecretByUserIdAndTarget,
      upsertSocialTokenSetSecret,
    } = createAccountIdentitiesRequester();

    await expect(
      accountIdentitiesRequest
        .put('/my-account/identities')
        .send({ newIdentifierVerificationRecordId: 'verification-record-id' })
    ).resolves.toHaveProperty('status', 204);

    expect(deleteSocialTokenSetSecretByUserIdAndTarget).toHaveBeenCalledWith('foo', 'github');
    expect(upsertSocialTokenSetSecret).not.toHaveBeenCalled();
  });

  it('does not fail identity replacement when clearing the stored token secret fails', async () => {
    const {
      accountIdentitiesRequest,
      deleteSocialTokenSetSecretByUserIdAndTarget,
      upsertSocialTokenSetSecret,
    } = createAccountIdentitiesRequester();
    deleteSocialTokenSetSecretByUserIdAndTarget.mockRejectedValue(new Error('database error'));

    await expect(
      accountIdentitiesRequest
        .put('/my-account/identities')
        .send({ newIdentifierVerificationRecordId: 'verification-record-id' })
    ).resolves.toHaveProperty('status', 204);

    expect(deleteSocialTokenSetSecretByUserIdAndTarget).toHaveBeenCalledWith('foo', 'github');
    expect(upsertSocialTokenSetSecret).not.toHaveBeenCalled();
  });

  it('keeps the stored token secret when relinking the same social user and the verification has no tokens', async () => {
    const {
      accountIdentitiesRequest,
      deleteSocialTokenSetSecretByUserIdAndTarget,
      upsertSocialTokenSetSecret,
    } = createAccountIdentitiesRequester('github-user');

    await expect(
      accountIdentitiesRequest
        .put('/my-account/identities')
        .send({ newIdentifierVerificationRecordId: 'verification-record-id' })
    ).resolves.toHaveProperty('status', 204);

    expect(deleteSocialTokenSetSecretByUserIdAndTarget).not.toHaveBeenCalled();
    expect(upsertSocialTokenSetSecret).not.toHaveBeenCalled();
  });
});
