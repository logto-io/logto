import { Event } from '@logto/schemas';
import { mockEsm, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type {
  Identifier,
  IdentifierVerifiedInteractionResult,
  InteractionContext,
} from '../types/index.js';

const { jest } = import.meta;

const { findUserById } = await mockEsmWithActual('#src/queries/user.js', () => ({
  findUserById: jest.fn().mockResolvedValue({ id: 'foo' }),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
}));

const { storeInteractionResult } = mockEsm('../utils/interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));

mockEsm('../utils/index.js', () => ({
  isUserPasswordSet: jest.fn().mockResolvedValueOnce(true),
}));

const verifyProfile = await pickDefault(import('./profile-verification.js'));

describe('Should throw when providing existing identifiers in profile', () => {
  const provider = createMockProvider();
  const baseCtx = createContextWithRouteParameters();
  const identifiers: Identifier[] = [
    { key: 'accountId', value: 'foo' },
    { key: 'emailVerified', value: 'email' },
    { key: 'phoneVerified', value: 'phone' },
    { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
  ];
  const interaction: IdentifierVerifiedInteractionResult = {
    event: Event.SignIn,
    accountId: 'foo',
    identifiers,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username exists', async () => {
    findUserById.mockResolvedValueOnce({ id: 'foo', username: 'foo' });

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          username: 'username',
        },
      },
    };

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.username_exists_in_profile',
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('email exists', async () => {
    findUserById.mockResolvedValueOnce({ id: 'foo', primaryEmail: 'email' });

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          email: 'email',
        },
      },
    };

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.email_exists_in_profile',
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('phone exists', async () => {
    findUserById.mockResolvedValueOnce({ id: 'foo', primaryPhone: 'phone' });

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          phone: 'phone',
        },
      },
    };

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.phone_exists_in_profile',
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('password exists', async () => {
    findUserById.mockResolvedValueOnce({ id: 'foo' });

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          password: 'password',
        },
      },
    };

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.password_exists_in_profile',
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });
});
