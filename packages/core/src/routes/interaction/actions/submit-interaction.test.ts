import {
  InteractionEvent,
  adminConsoleApplicationId,
  adminTenantId,
  type CreateUser,
  type User,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import type Provider from 'oidc-provider';

import { type InsertUserResult } from '#src/libraries/user.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type {
  Identifier,
  VerifiedForgotPasswordInteractionResult,
  VerifiedRegisterInteractionResult,
  VerifiedSignInInteractionResult,
} from '../types/index.js';
import { userMfaDataKey } from '../verifications/mfa-verification.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const getLogtoConnectorById = jest
  .fn()
  .mockResolvedValue({ metadata: { target: 'logto' }, dbEntry: { syncProfile: true } });

const { assignInteractionResults } = mockEsm('#src/libraries/session.js', () => ({
  assignInteractionResults: jest.fn(),
}));

const { encryptUserPassword } = mockEsm('#src/libraries/user.utils.js', () => ({
  encryptUserPassword: jest.fn().mockResolvedValue({
    passwordEncrypted: 'passwordEncrypted',
    passwordEncryptionMethod: 'plain',
  }),
}));

mockEsm('@logto/shared', () => ({
  generateStandardId: jest.fn().mockReturnValue('uid'),
}));

mockEsm('#src/utils/tenant.js', () => ({
  getTenantId: () => [adminTenantId],
}));

const userQueries = {
  findUserById: jest.fn().mockResolvedValue({
    identities: { google: { userId: 'googleId', details: {} } },
    mfaVerifications: [],
  }),
  updateUserById: jest.fn(async (id: string, user: Partial<User>) => user as User),
  hasActiveUsers: jest.fn().mockResolvedValue(true),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithPhone: jest.fn().mockResolvedValue(false),
};

const { hasActiveUsers, updateUserById, hasUserWithEmail, hasUserWithPhone } = userQueries;

const userLibraries = {
  generateUserId: jest.fn().mockResolvedValue('uid'),
  insertUser: jest.fn(async (user: CreateUser): Promise<InsertUserResult> => [user as User]),
};
const { generateUserId, insertUser } = userLibraries;

const submitInteraction = await pickDefault(import('./submit-interaction.js'));
const now = Date.now();

jest.useFakeTimers().setSystemTime(now);

describe('submit action', () => {
  const tenant = new MockTenant(
    undefined,
    { users: userQueries, signInExperiences: { updateDefaultSignInExperience: jest.fn() } },
    { getLogtoConnectorById },
    { users: userLibraries }
  );
  const ctx = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    interactionDetails: { params: {} } as Awaited<ReturnType<Provider['interactionDetails']>>,
    assignInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
  };
  const profile = {
    username: 'username',
    password: 'password',
    phone: '123456',
    email: 'email@logto.io',
    connectorId: 'logto',
  };

  const userInfo = {
    id: 'foo',
    name: 'foo_social',
    avatar: 'avatar',
    email: 'email@socail.com',
    phone: '123123',
  };

  const identifiers: Identifier[] = [
    {
      key: 'social',
      connectorId: 'logto',
      userInfo,
    },
  ];

  const upsertProfile = {
    username: 'username',
    primaryPhone: '123456',
    primaryEmail: 'email@logto.io',
    passwordEncrypted: 'passwordEncrypted',
    passwordEncryptionMethod: 'plain',
    identities: {
      logto: { userId: userInfo.id, details: userInfo },
    },
    name: userInfo.name,
    avatar: userInfo.avatar,
    lastSignInAt: now,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('register', async () => {
    const interaction: VerifiedRegisterInteractionResult = {
      event: InteractionEvent.Register,
      profile,
      identifiers,
    };

    await submitInteraction(interaction, ctx, tenant);

    expect(generateUserId).toBeCalled();
    expect(hasActiveUsers).not.toBeCalled();
    expect(encryptUserPassword).toBeCalledWith('password');
    expect(getLogtoConnectorById).toBeCalledWith('logto');

    expect(insertUser).toBeCalledWith(
      {
        id: 'uid',
        ...upsertProfile,
      },
      ['user']
    );
    expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
      login: { accountId: 'uid' },
    });

    expect(ctx.appendDataHookContext).toBeCalledWith('User.Created', {
      user: {
        id: 'uid',
        ...upsertProfile,
      },
    });
  });

  it('register and use pendingAccountId', async () => {
    const interaction: VerifiedRegisterInteractionResult = {
      event: InteractionEvent.Register,
      profile,
      identifiers,
      pendingAccountId: 'pending-account-id',
    };

    await submitInteraction(interaction, ctx, tenant);

    expect(generateUserId).not.toBeCalled();
    expect(hasActiveUsers).not.toBeCalled();
    expect(encryptUserPassword).toBeCalledWith('password');
    expect(getLogtoConnectorById).toBeCalledWith('logto');

    expect(insertUser).toBeCalledWith(
      {
        id: 'pending-account-id',
        ...upsertProfile,
      },
      ['user']
    );
    expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
      login: { accountId: 'pending-account-id' },
    });

    expect(ctx.appendDataHookContext).toBeCalledWith('User.Created', {
      user: {
        id: 'pending-account-id',
        ...upsertProfile,
      },
    });
  });

  it('register with mfaSkipped', async () => {
    const interaction: VerifiedRegisterInteractionResult = {
      event: InteractionEvent.Register,
      profile,
      identifiers,
      mfaSkipped: true,
    };

    await submitInteraction(interaction, ctx, tenant);
    expect(insertUser).toBeCalledWith(
      {
        id: 'uid',
        ...upsertProfile,
        logtoConfig: {
          [userMfaDataKey]: {
            skipped: true,
          },
        },
      },
      ['user']
    );
  });

  it('register new social user', async () => {
    const interaction: VerifiedRegisterInteractionResult = {
      event: InteractionEvent.Register,
      profile: { connectorId: 'logto', username: 'username' },
      identifiers,
    };

    await submitInteraction(interaction, ctx, tenant);

    expect(generateUserId).toBeCalled();
    expect(hasActiveUsers).not.toBeCalled();
    expect(encryptUserPassword).not.toBeCalled();
    expect(getLogtoConnectorById).toBeCalledWith('logto');

    expect(insertUser).toBeCalledWith(
      {
        id: 'uid',
        username: 'username',
        identities: {
          logto: { userId: userInfo.id, details: userInfo },
        },
        name: userInfo.name,
        avatar: userInfo.avatar,
        primaryEmail: userInfo.email,
        primaryPhone: userInfo.phone,
        lastSignInAt: now,
      },
      ['user']
    );
  });

  it('register new social user should not sync email and phone if already exists', async () => {
    hasUserWithEmail.mockResolvedValueOnce(true);
    hasUserWithPhone.mockResolvedValueOnce(true);

    const interaction: VerifiedRegisterInteractionResult = {
      event: InteractionEvent.Register,
      profile: { connectorId: 'logto', username: 'username' },
      identifiers,
    };

    await submitInteraction(interaction, ctx, tenant);

    expect(generateUserId).toBeCalled();
    expect(hasActiveUsers).not.toBeCalled();
    expect(encryptUserPassword).not.toBeCalled();
    expect(getLogtoConnectorById).toBeCalledWith('logto');

    expect(insertUser).toBeCalledWith(
      {
        id: 'uid',
        username: 'username',
        identities: {
          logto: { userId: userInfo.id, details: userInfo },
        },
        name: userInfo.name,
        avatar: userInfo.avatar,
        lastSignInAt: now,
      },
      ['user']
    );
  });

  it('admin user register', async () => {
    hasActiveUsers.mockResolvedValueOnce(false);
    const adminConsoleCtx = {
      ...ctx,
      // @ts-expect-error mock interaction details
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      interactionDetails: {
        params: {
          client_id: adminConsoleApplicationId,
        },
      } as Awaited<ReturnType<Provider['interactionDetails']>>,
    };

    const interaction: VerifiedRegisterInteractionResult = {
      event: InteractionEvent.Register,
      profile,
      identifiers,
    };

    await submitInteraction(interaction, adminConsoleCtx, tenant);

    expect(generateUserId).toBeCalled();
    expect(hasActiveUsers).toBeCalled();
    expect(encryptUserPassword).toBeCalledWith('password');
    expect(getLogtoConnectorById).toBeCalledWith('logto');

    expect(insertUser).toBeCalledWith(
      {
        id: 'uid',
        ...upsertProfile,
      },
      ['user', 'default:admin']
    );
    expect(assignInteractionResults).toBeCalledWith(adminConsoleCtx, tenant.provider, {
      login: { accountId: 'uid' },
    });
  });

  it('sign-in without new profile', async () => {
    const interaction: VerifiedSignInInteractionResult = {
      event: InteractionEvent.SignIn,
      accountId: 'foo',
      identifiers: [{ key: 'accountId', value: 'foo' }],
    };

    await submitInteraction(interaction, ctx, tenant);

    expect(updateUserById).toBeCalledWith('foo', {
      lastSignInAt: now,
    });
    expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
      login: { accountId: 'foo' },
    });
    expect(ctx.appendDataHookContext).not.toBeCalled();
  });

  it('sign-in with new profile', async () => {
    getLogtoConnectorById.mockResolvedValueOnce({
      metadata: { target: 'logto' },
      dbEntry: { syncProfile: false },
    });

    const interaction: VerifiedSignInInteractionResult = {
      event: InteractionEvent.SignIn,
      accountId: 'foo',
      profile: { connectorId: 'logto', password: 'password' },
      identifiers,
    };

    await submitInteraction(interaction, ctx, tenant);

    expect(encryptUserPassword).toBeCalledWith('password');
    expect(getLogtoConnectorById).toBeCalledWith('logto');

    const updateProfile = {
      passwordEncrypted: 'passwordEncrypted',
      passwordEncryptionMethod: 'plain',
      identities: {
        logto: { userId: userInfo.id, details: userInfo },
        google: { userId: 'googleId', details: {} },
      },
      lastSignInAt: now,
    };

    expect(updateUserById).toBeCalledWith('foo', updateProfile);
    expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
      login: { accountId: 'foo' },
    });
    expect(ctx.appendDataHookContext).toBeCalledWith('User.Data.Updated', {
      user: updateProfile,
    });
  });

  it('sign-in with mfaSkipped', async () => {
    getLogtoConnectorById.mockResolvedValueOnce({
      metadata: { target: 'logto' },
      dbEntry: { syncProfile: false },
    });
    const interaction: VerifiedSignInInteractionResult = {
      event: InteractionEvent.SignIn,
      accountId: 'foo',
      profile: { connectorId: 'logto', password: 'password' },
      identifiers,
      mfaSkipped: true,
    };

    await submitInteraction(interaction, ctx, tenant);

    expect(updateUserById).toBeCalledWith('foo', {
      passwordEncrypted: 'passwordEncrypted',
      passwordEncryptionMethod: 'plain',
      identities: {
        logto: { userId: userInfo.id, details: userInfo },
        google: { userId: 'googleId', details: {} },
      },
      lastSignInAt: now,
      logtoConfig: {
        [userMfaDataKey]: {
          skipped: true,
        },
      },
    });
  });

  it('sign-in and sync new Social', async () => {
    getLogtoConnectorById.mockResolvedValueOnce({
      metadata: { target: 'logto' },
      dbEntry: { syncProfile: true },
    });

    const interaction: VerifiedSignInInteractionResult = {
      event: InteractionEvent.SignIn,
      accountId: 'foo',
      profile: { email: 'email' },
      identifiers,
    };

    await submitInteraction(interaction, ctx, tenant);
    expect(getLogtoConnectorById).toBeCalledWith('logto');
    expect(updateUserById).toBeCalledWith('foo', {
      primaryEmail: 'email',
      name: userInfo.name,
      avatar: userInfo.avatar,
      lastSignInAt: now,
    });
    expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
      login: { accountId: 'foo' },
    });
    expect(ctx.appendDataHookContext).toBeCalledWith('User.Data.Updated', {
      user: {
        primaryEmail: 'email',
        name: userInfo.name,
        avatar: userInfo.avatar,
        lastSignInAt: now,
      },
    });
  });

  it('reset password', async () => {
    const interaction: VerifiedForgotPasswordInteractionResult = {
      event: InteractionEvent.ForgotPassword,
      accountId: 'foo',
      identifiers: [{ key: 'accountId', value: 'foo' }],
      profile: { password: 'password' },
    };
    await submitInteraction(interaction, ctx, tenant);

    expect(encryptUserPassword).toBeCalledWith('password');
    expect(updateUserById).toBeCalledWith('foo', {
      passwordEncrypted: 'passwordEncrypted',
      passwordEncryptionMethod: 'plain',
    });
    expect(assignInteractionResults).not.toBeCalled();
    expect(ctx.appendDataHookContext).toBeCalledWith('User.Data.Updated', {
      user: {
        passwordEncrypted: 'passwordEncrypted',
        passwordEncryptionMethod: 'plain',
      },
    });
  });
});
