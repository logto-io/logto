import { Event } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { findUserById } from '#src/queries/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { Identifier, InteractionContext } from '../types/index.js';
import profileVerification from './profile-verification.js';

jest.mock('#src/queries/user.js', () => ({
  findUserById: jest.fn().mockResolvedValue({ id: 'foo' }),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
}));

jest.mock('../utils/index.js', () => ({
  isUserPasswordSet: jest.fn().mockResolvedValueOnce(true),
}));

describe('Existed profile should throw', () => {
  const baseCtx = createContextWithRouteParameters();
  const identifiers: Identifier[] = [
    { key: 'accountId', value: 'foo' },
    { key: 'verifiedEmail', value: 'email' },
    { key: 'verifiedPhone', value: 'phone' },
    { key: 'social', connectorId: 'connectorId', value: { id: 'foo' } },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username exist', async () => {
    (findUserById as jest.Mock).mockResolvedValueOnce({ id: 'foo', username: 'foo' });

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          username: 'username',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
      new RequestError({
        code: 'user.username_exists',
      })
    );
  });

  it('email exist', async () => {
    (findUserById as jest.Mock).mockResolvedValueOnce({ id: 'foo', primaryEmail: 'email' });

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          email: 'email',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
      new RequestError({
        code: 'user.email_exists',
      })
    );
  });

  it('phone exist', async () => {
    (findUserById as jest.Mock).mockResolvedValueOnce({ id: 'foo', primaryPhone: 'phone' });

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          phone: 'phone',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
      new RequestError({
        code: 'user.sms_exists',
      })
    );
  });

  it('password exist', async () => {
    (findUserById as jest.Mock).mockResolvedValueOnce({ id: 'foo' });

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          password: 'password',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
      new RequestError({
        code: 'user.password_exists',
      })
    );
  });
});
