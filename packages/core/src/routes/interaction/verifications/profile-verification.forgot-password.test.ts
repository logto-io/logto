import { InteractionEvent } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import type { Identifier } from '../types/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const findUserById = jest.fn().mockResolvedValue({ id: 'foo', passwordEncrypted: 'passwordHash' });

const tenantContext = new MockTenant(undefined, { users: { findUserById } });

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
    await expect(verifyProfile(tenantContext, baseInteraction)).rejects.toMatchError(
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

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
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

    await expect(verifyProfile(tenantContext, interaction)).resolves.not.toThrow();
    expect(findUserById).toBeCalledWith(interaction.accountId);
    expect(argon2Verify).toBeCalledWith({ password: 'password', hash: 'passwordHash' });
  });
});
