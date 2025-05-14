import { InteractionEvent } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import type { Identifier, IdentifierVerifiedInteractionResult } from '../types/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const userQueries = {
  findUserById: jest.fn().mockResolvedValue({ id: 'foo' }),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
};
const { findUserById } = userQueries;

mockEsm('../utils/index.js', () => ({
  isUserPasswordSet: jest.fn().mockResolvedValueOnce(true),
}));

const tenantContext = new MockTenant(undefined, { users: userQueries });
const verifyProfile = await pickDefault(import('./profile-verification.js'));

describe('Should throw when providing existing identifiers in profile', () => {
  const identifiers: Identifier[] = [
    { key: 'accountId', value: 'foo' },
    { key: 'emailVerified', value: 'email' },
    { key: 'phoneVerified', value: 'phone' },
    { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
  ];
  const baseInteraction: IdentifierVerifiedInteractionResult = {
    event: InteractionEvent.SignIn,
    accountId: 'foo',
    identifiers,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username exists', async () => {
    findUserById.mockResolvedValueOnce({ id: 'foo', username: 'foo' });

    const interaction = {
      ...baseInteraction,
      profile: {
        username: 'username',
      },
    };

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.username_exists_in_profile',
      })
    );
  });

  it('email exists', async () => {
    findUserById.mockResolvedValueOnce({ id: 'foo', primaryEmail: 'email' });

    const interaction = {
      ...baseInteraction,
      profile: {
        email: 'email',
      },
    };

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.email_exists_in_profile',
      })
    );
  });

  it('phone exists', async () => {
    findUserById.mockResolvedValueOnce({ id: 'foo', primaryPhone: 'phone' });

    const interaction = {
      ...baseInteraction,
      profile: {
        phone: 'phone',
      },
    };

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.phone_exists_in_profile',
      })
    );
  });

  it('password exists', async () => {
    findUserById.mockResolvedValueOnce({ id: 'foo' });

    const interaction = {
      ...baseInteraction,
      profile: {
        password: 'password',
      },
    };

    await expect(verifyProfile(tenantContext, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.password_exists_in_profile',
      })
    );
  });
});
