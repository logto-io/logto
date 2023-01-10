import { InteractionEvent, adminConsoleApplicationId, UserRole } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import type Provider from 'oidc-provider';

import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type {
  Identifier,
  VerifiedRegisterInteractionResult,
  VerifiedSignInInteractionResult,
  VerifiedForgotPasswordInteractionResult,
} from '../types/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const { getLogtoConnectorById } = mockEsm('#src/libraries/connector.js', () => ({
  getLogtoConnectorById: jest
    .fn()
    .mockResolvedValue({ metadata: { target: 'logto' }, dbEntry: { syncProfile: true } }),
}));

const { assignInteractionResults } = mockEsm('#src/libraries/session.js', () => ({
  assignInteractionResults: jest.fn(),
}));

const { encryptUserPassword } = mockEsm('#src/libraries/user.js', () => ({
  encryptUserPassword: jest.fn().mockResolvedValue({
    passwordEncrypted: 'passwordEncrypted',
    passwordEncryptionMethod: 'plain',
  }),
}));

const userQueries = {
  findUserById: jest
    .fn()
    .mockResolvedValue({ identities: { google: { userId: 'googleId', details: {} } } }),
  updateUserById: jest.fn(),
  hasActiveUsers: jest.fn().mockResolvedValue(true),
};
const { hasActiveUsers, updateUserById } = userQueries;

const userLibraries = { generateUserId: jest.fn().mockResolvedValue('uid'), insertUser: jest.fn() };
const { generateUserId, insertUser } = userLibraries;

const submitInteraction = await pickDefault(import('./submit-interaction.js'));
const now = Date.now();

jest.useFakeTimers().setSystemTime(now);

describe('submit action', () => {
  const tenant = new MockTenant(undefined, { users: userQueries }, { users: userLibraries });
  const ctx = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    interactionDetails: { params: {} } as Awaited<ReturnType<Provider['interactionDetails']>>,
  };
  const profile = {
    username: 'username',
    password: 'password',
    phone: '123456',
    email: 'email@logto.io',
    connectorId: 'logto',
  };

  const userInfo = { id: 'foo', name: 'foo_social', avatar: 'avatar' };

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

    expect(insertUser).toBeCalledWith({
      id: 'uid',
      ...upsertProfile,
    });
    expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
      login: { accountId: 'uid' },
    });
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

    expect(insertUser).toBeCalledWith({
      id: 'uid',
      roleNames: [UserRole.Admin],
      ...upsertProfile,
    });
    expect(assignInteractionResults).toBeCalledWith(adminConsoleCtx, tenant.provider, {
      login: { accountId: 'uid' },
    });
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

    expect(updateUserById).toBeCalledWith('foo', {
      passwordEncrypted: 'passwordEncrypted',
      passwordEncryptionMethod: 'plain',
      identities: {
        logto: { userId: userInfo.id, details: userInfo },
        google: { userId: 'googleId', details: {} },
      },
      lastSignInAt: now,
    });
    expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
      login: { accountId: 'foo' },
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
  });
});
