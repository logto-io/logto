import { Event } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import { assignInteractionResults } from '#src/lib/session.js';
import { encryptUserPassword, generateUserId, insertUser } from '#src/lib/user.js';
import { updateUserById } from '#src/queries/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type {
  Identifier,
  VerifiedRegisterInteractionResult,
  InteractionContext,
  VerifiedSignInInteractionResult,
  VerifiedForgotPasswordInteractionResult,
} from '../types/index.js';
import submitInteraction from './submit-interaction.js';

jest.mock('#src/connectors/index.js', () => ({
  getLogtoConnectorById: jest
    .fn()
    .mockResolvedValue({ metadata: { target: 'logto' }, dbEntry: { syncProfile: true } }),
}));

jest.mock('#src/lib/session.js', () => ({
  assignInteractionResults: jest.fn(),
}));

jest.mock('#src/lib/user.js', () => ({
  encryptUserPassword: jest.fn().mockResolvedValue({
    passwordEncrypted: 'passwordEncrypted',
    passwordEncryptionMethod: 'plain',
  }),
  generateUserId: jest.fn().mockResolvedValue('uid'),
  insertUser: jest.fn(),
}));

jest.mock('#src/queries/user.js', () => ({
  findUserById: jest
    .fn()
    .mockResolvedValue({ identities: { google: { userId: 'googleId', details: {} } } }),
  updateUserById: jest.fn(),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(async () => ({ params: {}, jti: 'jti' })),
  })),
}));

const now = Date.now();

jest.useFakeTimers().setSystemTime(now);

describe('submit action', () => {
  const provider = new Provider('');
  const log = jest.fn();
  const ctx: InteractionContext = {
    ...createContextWithRouteParameters(),
    log,
    interactionPayload: { event: Event.SignIn },
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
      event: Event.Register,
      profile,
      identifiers,
    };

    await submitInteraction(interaction, ctx, provider);

    expect(generateUserId).toBeCalled();
    expect(encryptUserPassword).toBeCalledWith('password');
    expect(getLogtoConnectorById).toBeCalledWith('logto');

    expect(insertUser).toBeCalledWith({
      id: 'uid',
      ...upsertProfile,
    });
    expect(assignInteractionResults).toBeCalledWith(ctx, provider, { login: { accountId: 'uid' } });
  });

  it('sign-in', async () => {
    (getLogtoConnectorById as jest.Mock).mockResolvedValueOnce({
      metadata: { target: 'logto' },
      dbEntry: { syncProfile: false },
    });
    const interaction: VerifiedSignInInteractionResult = {
      event: Event.SignIn,
      accountId: 'foo',
      profile: { connectorId: 'logto', password: 'password' },
      identifiers,
    };

    await submitInteraction(interaction, ctx, provider);

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
    expect(assignInteractionResults).toBeCalledWith(ctx, provider, { login: { accountId: 'foo' } });
  });

  it('reset password', async () => {
    const interaction: VerifiedForgotPasswordInteractionResult = {
      event: Event.ForgotPassword,
      accountId: 'foo',
      profile: { password: 'password' },
    };
    await submitInteraction(interaction, ctx, provider);
    expect(encryptUserPassword).toBeCalledWith('password');
    expect(updateUserById).toBeCalledWith('foo', {
      passwordEncrypted: 'passwordEncrypted',
      passwordEncryptionMethod: 'plain',
    });
    expect(assignInteractionResults).not.toBeCalled();
  });
});
