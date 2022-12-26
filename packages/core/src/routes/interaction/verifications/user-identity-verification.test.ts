import { InteractionEvent } from '@logto/schemas';
import { mockEsm, mockEsmDefault, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';

import type { SignInInteractionResult } from '../types/index.js';

const { jest } = import.meta;

const findUserByIdentifier = mockEsmDefault('../utils/find-user-by-identifier.js', () => jest.fn());

mockEsm('#src/libraries/social.js', () => ({
  findSocialRelatedUser: jest.fn().mockResolvedValue(null),
}));

const verifyUserAccount = await pickDefault(import('./user-identity-verification.js'));

describe('verifyUserAccount', () => {
  const findUserByIdentifierMock = findUserByIdentifier;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('empty identifiers with accountId', async () => {
    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      accountId: 'foo',
    };

    const result = await verifyUserAccount(interaction);

    expect(result).toEqual(result);
  });

  it('empty identifiers withOut accountId should throw', async () => {
    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
    };

    await expect(verifyUserAccount(interaction)).rejects.toMatchError(
      new RequestError({ code: 'session.identifier_not_found', status: 404 })
    );
  });

  it('verify accountId identifier', async () => {
    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [{ key: 'accountId', value: 'foo' }],
    };

    const result = await verifyUserAccount(interaction);

    expect(result).toEqual({ event: InteractionEvent.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify emailVerified identifier', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [{ key: 'emailVerified', value: 'email' }],
    };

    const result = await verifyUserAccount(interaction);
    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });

    expect(result).toEqual({ event: InteractionEvent.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify phoneVerified identifier', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [{ key: 'phoneVerified', value: '123456' }],
    };

    const result = await verifyUserAccount(interaction);
    expect(findUserByIdentifierMock).toBeCalledWith({ phone: '123456' });

    expect(result).toEqual({ event: InteractionEvent.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify social identifier', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [{ key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } }],
    };

    const result = await verifyUserAccount(interaction);
    expect(findUserByIdentifierMock).toBeCalledWith({
      connectorId: 'connectorId',
      userInfo: { id: 'foo' },
    });

    expect(result).toEqual({ event: InteractionEvent.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify social identifier user identity not exist', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce(null);

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [{ key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } }],
    };

    await expect(verifyUserAccount(interaction)).rejects.toMatchError(
      new RequestError(
        {
          code: 'user.identity_not_exist',
          status: 422,
        },
        null
      )
    );

    expect(findUserByIdentifierMock).toBeCalledWith({
      connectorId: 'connectorId',
      userInfo: { id: 'foo' },
    });
  });

  it('verify accountId and emailVerified identifier with same user', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [
        { key: 'accountId', value: 'foo' },
        { key: 'emailVerified', value: 'email' },
      ],
    };

    const result = await verifyUserAccount(interaction);
    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });

    expect(result).toEqual({ event: InteractionEvent.SignIn, accountId: 'foo', identifiers: [] });
  });

  it('verify accountId and emailVerified identifier with email user not exist', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce(null);

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [
        { key: 'accountId', value: 'foo' },
        { key: 'emailVerified', value: 'email' },
      ],
    };

    await expect(verifyUserAccount(interaction)).rejects.toMatchError(
      new RequestError({ code: 'user.user_not_exist', status: 404 }, { identifier: 'email' })
    );

    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });
  });

  it('verify phoneVerified and emailVerified identifier with email user suspend', async () => {
    findUserByIdentifierMock
      .mockResolvedValueOnce({ id: 'foo' })
      .mockResolvedValueOnce({ id: 'foo2', isSuspended: true });

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [
        { key: 'emailVerified', value: 'email' },
        { key: 'phoneVerified', value: '123456' },
      ],
    };

    await expect(verifyUserAccount(interaction)).rejects.toMatchError(
      new RequestError({ code: 'user.suspended', status: 401 })
    );

    expect(findUserByIdentifierMock).toHaveBeenNthCalledWith(1, { email: 'email' });
    expect(findUserByIdentifierMock).toHaveBeenNthCalledWith(2, { phone: '123456' });
  });

  it('verify phoneVerified and emailVerified identifier returns inconsistent id', async () => {
    findUserByIdentifierMock
      .mockResolvedValueOnce({ id: 'foo' })
      .mockResolvedValueOnce({ id: 'foo2' });

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [
        { key: 'emailVerified', value: 'email' },
        { key: 'phoneVerified', value: '123456' },
      ],
    };

    await expect(verifyUserAccount(interaction)).rejects.toMatchError(
      new RequestError('session.verification_failed')
    );
    expect(findUserByIdentifierMock).toHaveBeenNthCalledWith(1, { email: 'email' });
    expect(findUserByIdentifierMock).toHaveBeenNthCalledWith(2, { phone: '123456' });
  });

  it('verify emailVerified identifier returns inconsistent id with existing accountId', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      accountId: 'foo2',
      identifiers: [{ key: 'emailVerified', value: 'email' }],
    };

    await expect(verifyUserAccount(interaction)).rejects.toMatchError(
      new RequestError('session.verification_failed')
    );
    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });
  });

  it('profile use identifier should remain', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });

    const interaction: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [
        { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
        { key: 'emailVerified', value: 'email' },
        { key: 'phoneVerified', value: '123456' },
      ],
      profile: {
        phone: '123456',
        connectorId: 'connectorId',
      },
    };

    const result = await verifyUserAccount(interaction);
    expect(findUserByIdentifierMock).toBeCalledWith({ email: 'email' });

    expect(result).toEqual({
      event: InteractionEvent.SignIn,
      accountId: 'foo',
      identifiers: [
        { key: 'social', connectorId: 'connectorId', userInfo: { id: 'foo' } },
        { key: 'phoneVerified', value: '123456' },
      ],
      profile: {
        phone: '123456',
        connectorId: 'connectorId',
      },
    });
  });
});
