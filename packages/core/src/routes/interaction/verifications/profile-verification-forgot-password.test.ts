import { Event } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { mockEsm, mockEsmWithActual, pickDefault } from '#src/test-utils/mock.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { InteractionContext } from '../types/index.js';

const { jest } = import.meta;

const { storeInteractionResult } = mockEsm('#src/routes/interaction/utils/interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));

const { findUserById } = await mockEsmWithActual('#src/queries/user.js', () => ({
  findUserById: jest.fn().mockResolvedValue({ id: 'foo', passwordEncrypted: 'passwordHash' }),
}));

const { argon2Verify } = mockEsm('hash-wasm', () => ({
  argon2Verify: jest.fn(),
}));

const verifyProfile = await pickDefault(import('./profile-verification.js'));

describe('forgot password interaction profile verification', () => {
  const provider = createMockProvider();
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

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.new_password_required_in_profile',
        status: 422,
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('same password', async () => {
    argon2Verify.mockResolvedValueOnce(true);
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.ForgotPassword,
        profile: {
          password: 'password',
        },
      },
    };

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
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

    await expect(verifyProfile(ctx, provider, interaction)).resolves.not.toThrow();
    expect(findUserById).toBeCalledWith(interaction.accountId);
    expect(argon2Verify).toBeCalledWith({ password: 'password', hash: 'passwordHash' });
    expect(storeInteractionResult).toBeCalled();
  });
});
