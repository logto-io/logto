import { Event } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { mockEsm, mockEsmWithActual, pickDefault } from '#src/test-utils/mock.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type {
  Identifier,
  InteractionContext,
  IdentifierVerifiedInteractionResult,
} from '../types/index.js';

const { jest } = import.meta;

const { storeInteractionResult } = mockEsm('#src/routes/interaction/utils/interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));

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

const baseCtx = createContextWithRouteParameters();
const identifiers: Identifier[] = [
  { key: 'accountId', value: 'foo' },
  { key: 'emailVerified', value: 'email@logto.io' },
  { key: 'phoneVerified', value: '123456' },
  { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
];
const provider = createMockProvider();

const interaction: IdentifierVerifiedInteractionResult = {
  event: Event.Register,
  identifiers,
};

describe('register payload guard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toThrow();
    expect(storeInteractionResult).not.toBeCalled();
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

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toThrow();
    expect(storeInteractionResult).not.toBeCalled();
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

    const result = await verifyProfile(ctx, provider, interaction);
    expect(result).toEqual({ ...interaction, profile: ctx.interactionPayload.profile });
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

    await expect(verifyProfile(ctx, provider, interaction)).resolves.not.toThrow();
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

    await expect(verifyProfile(ctx, provider, interaction)).resolves.not.toThrow();
  });
});

describe('profile registered validation', () => {
  it('username is registered', async () => {
    hasUser.mockResolvedValueOnce(true);

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

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.username_already_in_use',
        status: 422,
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('email is registered', async () => {
    hasUserWithEmail.mockResolvedValueOnce(true);

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          email: 'email@logto.io',
        },
      },
    };

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.email_already_in_use',
        status: 422,
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('phone is registered', async () => {
    hasUserWithPhone.mockResolvedValueOnce(true);

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          phone: '123456',
        },
      },
    };

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.phone_already_in_use',
        status: 422,
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('connector identity exist', async () => {
    hasUserWithIdentity.mockResolvedValueOnce(true);

    const ctx: InteractionContext = {
      ...baseCtx,
      interactionPayload: {
        event: Event.Register,
        profile: {
          connectorId: 'connectorId',
        },
      },
    };

    await expect(verifyProfile(ctx, provider, interaction)).rejects.toMatchError(
      new RequestError({
        code: 'user.identity_already_in_use',
        status: 422,
      })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });
});
