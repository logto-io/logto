import { Event } from '@logto/schemas';
import { argon2Verify } from 'hash-wasm';
import { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { findUserById } from '#src/queries/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { InteractionContext } from '../types/index.js';
import { storeInteractionResult } from '../utils/interaction.js';
import profileVerification from './profile-verification.js';

jest.mock('../utils/interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(async () => ({ params: {}, jti: 'jti' })),
  })),
}));

jest.mock('#src/queries/user.js', () => ({
  findUserById: jest.fn().mockResolvedValue({ id: 'foo', passwordEncrypted: 'passwordHash' }),
}));

jest.mock('hash-wasm', () => ({
  argon2Verify: jest.fn(),
}));

describe('forgot password interaction profile verification', () => {
  const provider = new Provider('');
  const baseCtx = createContextWithRouteParameters();

  const interaction = {
    event: Event.ForgotPassword,
    accountId: 'foo',
  };

  it('missing profile', async () => {
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.ForgotPassword,
      },
    };

    await expect(profileVerification(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.require_new_password',
        status: 422,
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('same password', async () => {
    (argon2Verify as jest.Mock).mockResolvedValueOnce(true);
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.ForgotPassword,
        profile: {
          password: 'password',
        },
      },
    };

    await expect(profileVerification(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.same_password',
        status: 422,
      })
    );
    expect(findUserById).toBeCalledWith(interaction.accountId);
    expect(argon2Verify).toBeCalledWith({ password: 'password', hash: 'passwordHash' });
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('proper set password', async () => {
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.ForgotPassword,
        profile: {
          password: 'password',
        },
      },
    };

    await expect(profileVerification(ctx, provider, interaction)).resolves.not.toThrow();
    expect(findUserById).toBeCalledWith(interaction.accountId);
    expect(argon2Verify).toBeCalledWith({ password: 'password', hash: 'passwordHash' });
    expect(storeInteractionResult).toBeCalled();
  });
});
