import { Event } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { InteractionContext, PayloadVerifiedInteractionResult } from '../types/index.js';
import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import { storeInteractionResult } from '../utils/interaction.js';
import userIdentityVerification from './user-identity-verification.js';

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(async () => ({ params: {}, jti: 'jti' })),
  })),
}));

jest.mock('../utils/find-user-by-identifier.js', () => jest.fn());
jest.mock('#src/lib/social.js', () => ({
  findSocialRelatedUser: jest.fn().mockResolvedValue(null),
}));

jest.mock('../utils/interaction.js', () => ({
  ...jest.requireActual('../utils/interaction.js'),
  storeInteractionResult: jest.fn(),
}));

describe('userIdentityVerification', () => {
  const findUserByIdentifierMock = findUserByIdentifier as jest.Mock;

  const ctx = {
    ...createContextWithRouteParameters(),
    interactionPayload: {
      event: Event.SignIn,
    },
  };
  const provider = new Provider('');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('empty identifiers with accountId', async () => {
    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      accountId: 'foo',
    };

    const result = await userIdentityVerification(interaction, ctx, provider);

    expect(storeInteractionResult).not.toBeCalled();
    expect(result).toEqual(result);
  });

  it('empty identifiers withOut accountId should throw', async () => {
    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
    };

    await expect(userIdentityVerification(interaction, ctx, provider)).rejects.toMatchError(
      new RequestError({ code: 'session.unauthorized', status: 401 })
    );
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('verify accountId identifier', async () => {
    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [{ key: 'accountId', value: 'foo' }],
    };

    const result = await userIdentityVerification(interaction, ctx, provider);

    expect(storeInteractionResult).toBeCalledWith(result, ctx, provider);
    expect(result).toEqual({ event: Event.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify emailVerified identifier', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [{ key: 'emailVerified', value: 'email' }],
    };

    const result = await userIdentityVerification(interaction, ctx, provider);
    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });
    expect(storeInteractionResult).toBeCalledWith(result, ctx, provider);

    expect(result).toEqual({ event: Event.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify phoneVerified identifier', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [{ key: 'phoneVerified', value: '123456' }],
    };

    const result = await userIdentityVerification(interaction, ctx, provider);
    expect(findUserByIdentifierMock).toBeCalledWith({ phone: '123456' });
    expect(storeInteractionResult).toBeCalledWith(result, ctx, provider);

    expect(result).toEqual({ event: Event.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify social identifier', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [{ key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } }],
    };

    const result = await userIdentityVerification(interaction, ctx, provider);
    expect(findUserByIdentifierMock).toBeCalledWith({
      connectorId: 'connectorId',
      userInfo: { id: 'foo' },
    });
    expect(storeInteractionResult).toBeCalledWith(result, ctx, provider);

    expect(result).toEqual({ event: Event.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify social identifier user identity not exist', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce(null);

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [{ key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } }],
    };

    await expect(userIdentityVerification(interaction, ctx, provider)).rejects.toMatchError(
      new RequestError(
        {
          code: 'user.identity_not_exists',
          status: 422,
        },
        null
      )
    );

    expect(findUserByIdentifierMock).toBeCalledWith({
      connectorId: 'connectorId',
      userInfo: { id: 'foo' },
    });

    expect(storeInteractionResult).not.toBeCalled();
  });

  it('verify accountId and emailVerified identifier with same user', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [
        { key: 'accountId', value: 'foo' },
        { key: 'emailVerified', value: 'email' },
      ],
    };

    const result = await userIdentityVerification(interaction, ctx, provider);
    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });
    expect(storeInteractionResult).toBeCalledWith(result, ctx, provider);
    expect(result).toEqual({ event: Event.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify accountId and emailVerified identifier with email user not exist', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce(null);

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [
        { key: 'accountId', value: 'foo' },
        { key: 'emailVerified', value: 'email' },
      ],
    };

    await expect(userIdentityVerification(interaction, ctx, provider)).rejects.toMatchError(
      new RequestError({ code: 'user.user_not_exist', status: 404 })
    );

    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('verify phoneVerified and emailVerified identifier with email user suspend', async () => {
    findUserByIdentifierMock
      .mockResolvedValueOnce({ id: 'foo' })
      .mockResolvedValueOnce({ id: 'foo2', isSuspended: true });

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [
        { key: 'emailVerified', value: 'email' },
        { key: 'phoneVerified', value: '123456' },
      ],
    };

    await expect(userIdentityVerification(interaction, ctx, provider)).rejects.toMatchError(
      new RequestError({ code: 'user.suspended', status: 401 })
    );

    expect(findUserByIdentifierMock).toHaveBeenNthCalledWith(1, { email: 'email' });
    expect(findUserByIdentifierMock).toHaveBeenNthCalledWith(2, { phone: '123456' });
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('verify phoneVerified and emailVerified identifier returns inconsistent id', async () => {
    findUserByIdentifierMock
      .mockResolvedValueOnce({ id: 'foo' })
      .mockResolvedValueOnce({ id: 'foo2' });

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [
        { key: 'emailVerified', value: 'email' },
        { key: 'phoneVerified', value: '123456' },
      ],
    };

    await expect(userIdentityVerification(interaction, ctx, provider)).rejects.toMatchError(
      new RequestError('session.verification_failed')
    );
    expect(findUserByIdentifierMock).toHaveBeenNthCalledWith(1, { email: 'email' });
    expect(findUserByIdentifierMock).toHaveBeenNthCalledWith(2, { phone: '123456' });
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('verify emailVerified identifier returns inconsistent id with existing accountId', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      accountId: 'foo2',
      identifiers: [{ key: 'emailVerified', value: 'email' }],
    };

    await expect(userIdentityVerification(interaction, ctx, provider)).rejects.toMatchError(
      new RequestError('session.verification_failed')
    );
    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('profile use identifier should remain', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: PayloadVerifiedInteractionResult = {
      event: Event.SignIn,
      identifiers: [
        { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
        { key: 'emailVerified', value: 'email' },
        { key: 'phoneVerified', value: '123456' },
      ],
      profile: {
        phone: '123456',
      },
    };

    const ctxWithSocialProfile: InteractionContext = {
      ...ctx,
      interactionPayload: {
        event: Event.SignIn,
        profile: {
          connectorId: 'connectorId',
        },
      },
    };

    const result = await userIdentityVerification(interaction, ctxWithSocialProfile, provider);
    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });
    expect(storeInteractionResult).toBeCalledWith(result, ctxWithSocialProfile, provider);
    expect(result).toEqual({
      event: Event.SignIn,
      accountId: 'foo',
      identifiers: [
        { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
        { key: 'phoneVerified', value: '123456' },
      ],
      profile: {
        phone: '123456',
      },
    });
  });
});
