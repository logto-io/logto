import { InteractionEvent } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';

import type { Identifier } from '../types/index.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

const { findUserById } = await mockEsmWithActual('#src/queries/user.js', () => ({
  findUserById: jest.fn().mockResolvedValue({ id: 'foo', passwordEncrypted: 'passwordHash' }),
}));

const { argon2Verify } = mockEsm('hash-wasm', () => ({
  argon2Verify: jest.fn(),
}));

const verifyProfile = await pickDefault(import('./profile-verification.js'));

describe('forgot password interaction profile verification', () => {
  const baseInteraction = {
    event: InteractionEvent.ForgotPassword,
    identifiers: [{ key: 'accountId', value: 'foo' }] as Identifier[],
    accountId: 'foo',
  };

  it('missing profile', async () => {
    await expect(verifyProfile(baseInteraction)).rejects.toMatchError(
      new RequestError({
        code: 'user.new_password_required_in_profile',
        status: 422,
      })
    );
  });

  it('same password', async () => {
    argon2Verify.mockResolvedValueOnce(true);
    const interaction = {
      ...baseInteraction,
      profile: {
        password: 'password',
      },
    };

    await expect(verifyProfile(interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.same_password',
        status: 422,
      })
    );
    expect(findUserById).toBeCalledWith(interaction.accountId);
    expect(argon2Verify).toBeCalledWith({ password: 'password', hash: 'passwordHash' });
  });

  it('proper set password', async () => {
    const interaction = {
      ...baseInteraction,
      profile: {
        password: 'password',
      },
    };

    await expect(verifyProfile(interaction)).resolves.not.toThrow();
    expect(findUserById).toBeCalledWith(interaction.accountId);
    expect(argon2Verify).toBeCalledWith({ password: 'password', hash: 'passwordHash' });
  });
});
