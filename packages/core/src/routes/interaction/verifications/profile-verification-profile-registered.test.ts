import { Event } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import {
  hasUser,
  hasUserWithEmail,
  hasUserWithPhone,
  hasUserWithIdentity,
} from '#src/queries/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { Identifier, InteractionContext } from '../types/index.js';
import profileVerification from './profile-verification.js';

jest.mock('#src/queries/user.js', () => ({
  hasUser: jest.fn().mockResolvedValue(false),
  findUserById: jest.fn().mockResolvedValue({ id: 'foo' }),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
}));

jest.mock('#src/connectors/index.js', () => ({
  getLogtoConnectorById: jest.fn().mockResolvedValue({
    metadata: { target: 'logto' },
  }),
}));

const baseCtx = createContextWithRouteParameters();
const identifiers: Identifier[] = [
  { key: 'accountId', value: 'foo' },
  { key: 'verifiedEmail', value: 'email@logto.io' },
  { key: 'verifiedPhone', value: '123456' },
  { key: 'social', connectorId: 'connectorId', value: { id: 'foo' } },
];

describe('register payload guard', () => {
  it('username only should throw', async () => {
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          username: 'username',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toThrow();
  });

  it('password only should throw', async () => {
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          password: 'password',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toThrow();
  });

  it('username password is valid', async () => {
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          username: 'username',
          password: 'password',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).resolves.not.toThrow();
  });

  it('username with a given email is valid', async () => {
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          username: 'username',
          email: 'email@logto.io',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).resolves.not.toThrow();
  });

  it('password with a given email is valid', async () => {
    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          password: 'password',
          email: 'email@logto.io',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).resolves.not.toThrow();
  });
});

describe('profile registered validation', () => {
  it('username is registered', async () => {
    (hasUser as jest.Mock).mockResolvedValueOnce(true);

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          username: 'username',
          password: 'password',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
      new RequestError({
        code: 'user.username_exists_register',
        status: 422,
      })
    );
  });

  it('email is registered', async () => {
    (hasUserWithEmail as jest.Mock).mockResolvedValueOnce(true);

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          email: 'email@logto.io',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
      new RequestError({
        code: 'user.email_exists_register',
        status: 422,
      })
    );
  });

  it('phone is registered', async () => {
    (hasUserWithPhone as jest.Mock).mockResolvedValueOnce(true);

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          phone: '123456',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
      new RequestError({
        code: 'user.phone_exists_register',
        status: 422,
      })
    );
  });

  it('connector identity exist', async () => {
    (hasUserWithIdentity as jest.Mock).mockResolvedValueOnce(true);

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          connectorId: 'connectorId',
        },
      },
    };

    await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
      new RequestError({
        code: 'user.identity_exists',
        status: 422,
      })
    );
  });
});
