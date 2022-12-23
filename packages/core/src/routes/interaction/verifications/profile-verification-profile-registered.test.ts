import { InteractionEvent } from '@logto/schemas';
import { mockEsm, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';

import type { Identifier, IdentifierVerifiedInteractionResult } from '../types/index.js';

const { jest } = import.meta;

const { hasUser, hasUserWithEmail, hasUserWithPhone, hasUserWithIdentity } =
  await mockEsmWithActual('#src/queries/user.js', () => ({
    hasUser: jest.fn().mockResolvedValue(false),
    findUserById: jest.fn().mockResolvedValue({ id: 'foo' }),
    hasUserWithEmail: jest.fn().mockResolvedValue(false),
    hasUserWithPhone: jest.fn().mockResolvedValue(false),
    hasUserWithIdentity: jest.fn().mockResolvedValue(false),
  }));

mockEsm('#src/connectors/index.js', () => ({
  getLogtoConnectorById: jest.fn().mockResolvedValue({
    metadata: { target: 'logto' },
  }),
}));

const verifyProfile = await pickDefault(import('./profile-verification.js'));

const identifiers: Identifier[] = [
  { key: 'accountId', value: 'foo' },
  { key: 'emailVerified', value: 'email@logto.io' },
  { key: 'phoneVerified', value: '123456' },
  { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
];

const baseInteraction: IdentifierVerifiedInteractionResult = {
  event: InteractionEvent.Register,
  identifiers,
};

describe('register payload guard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username only should throw', async () => {
    const interaction = {
      ...baseInteraction,
      profile: {
        username: 'username',
      },
    };

    await expect(verifyProfile(interaction)).rejects.toThrow();
  });

  it('password only should throw', async () => {
    const interaction = {
      ...baseInteraction,
      profile: {
        password: 'password',
      },
    };

    await expect(verifyProfile(interaction)).rejects.toThrow();
  });

  it('username password is valid', async () => {
    const interaction = {
      ...baseInteraction,
      profile: {
        username: 'username',
        password: 'password',
      },
    };

    await expect(verifyProfile(interaction)).resolves.not.toThrow();
  });

  it('username with a given email is valid', async () => {
    const interaction = {
      ...baseInteraction,
      profile: {
        username: 'username',
        email: 'email@logto.io',
      },
    };

    await expect(verifyProfile(interaction)).resolves.not.toThrow();
  });

  it('password with a given email is valid', async () => {
    const interaction = {
      ...baseInteraction,
      profile: {
        password: 'password',
        email: 'email@logto.io',
      },
    };

    await expect(verifyProfile(interaction)).resolves.not.toThrow();
  });
});

describe('profile registered validation', () => {
  it('username is registered', async () => {
    hasUser.mockResolvedValueOnce(true);

    const interaction = {
      ...baseInteraction,
      profile: {
        username: 'username',
        password: 'password',
      },
    };

    await expect(verifyProfile(interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.username_already_in_use',
        status: 422,
      })
    );
  });

  it('email is registered', async () => {
    hasUserWithEmail.mockResolvedValueOnce(true);
    const interaction = {
      ...baseInteraction,
      profile: {
        email: 'email@logto.io',
      },
    };

    await expect(verifyProfile(interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.email_already_in_use',
        status: 422,
      })
    );
  });

  it('phone is registered', async () => {
    hasUserWithPhone.mockResolvedValueOnce(true);
    const interaction = {
      ...baseInteraction,
      profile: {
        phone: '123456',
      },
    };

    await expect(verifyProfile(interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.phone_already_in_use',
        status: 422,
      })
    );
  });

  it('connector identity exist', async () => {
    hasUserWithIdentity.mockResolvedValueOnce(true);

    const interaction = {
      ...baseInteraction,
      profile: {
        connectorId: 'connectorId',
      },
    };

    await expect(verifyProfile(interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.identity_already_in_use',
        status: 422,
      })
    );
  });
});
