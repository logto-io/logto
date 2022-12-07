import { Event } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { verifyUserPassword } from '#src/lib/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { AnonymousInteractionResult, VerifiedPhoneIdentifier } from '../types/index.js';
import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import { verifyIdentifierByPasscode } from '../utils/passcode-validation.js';
import { verifySocialIdentity } from '../utils/social-verification.js';
import identifierPayloadVerification from './identifier-payload-verification.js';

jest.mock('#src/lib/user.js', () => ({
  verifyUserPassword: jest.fn(),
}));

jest.mock('../utils/find-user-by-identifier.js', () => jest.fn());

jest.mock('../utils/interaction.js', () => ({
  ...jest.requireActual('../utils/interaction.js'),
  storeInteractionResult: jest.fn(),
}));

jest.mock('../utils/passcode-validation.js', () => ({
  verifyIdentifierByPasscode: jest.fn(),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(async () => ({ params: {}, jti: 'jti' })),
  })),
}));

jest.mock('../utils/social-verification.js', () => ({
  verifySocialIdentity: jest.fn().mockResolvedValue({ id: 'foo' }),
}));

const log = jest.fn();

describe('identifier verification', () => {
  const baseCtx = { ...createContextWithRouteParameters(), log };
  const verifyUserPasswordMock = verifyUserPassword as jest.Mock;
  const findUserByIdentifierMock = findUserByIdentifier as jest.Mock;
  const verifyIdentifierByPasscodeMock = verifyIdentifierByPasscode as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username password user not found', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce(null);

    const identifier = {
      username: 'username',
      password: 'password',
    };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    await expect(identifierPayloadVerification(ctx, new Provider(''))).rejects.toThrow();
    expect(findUserByIdentifier).toBeCalledWith({ username: 'username' });
    expect(verifyUserPassword).toBeCalledWith(null, 'password');
  });

  it('username password user is suspended', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPasswordMock.mockResolvedValueOnce({ id: 'foo', isSuspended: true });
    const identifier = {
      username: 'username',
      password: 'password',
    };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    await expect(identifierPayloadVerification(ctx, new Provider(''))).rejects.toMatchError(
      new RequestError({ code: 'user.suspended', status: 401 })
    );

    expect(findUserByIdentifier).toBeCalledWith({ username: 'username' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
  });

  it('email password', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPasswordMock.mockResolvedValueOnce({ id: 'foo', isSuspended: false });

    const identifier = {
      email: 'email',
      password: 'password',
    };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const result = await identifierPayloadVerification(ctx, new Provider(''));
    expect(findUserByIdentifier).toBeCalledWith({ email: 'email' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(result).toEqual({
      event: Event.SignIn,
      identifiers: [{ key: 'accountId', value: 'foo' }],
    });
  });

  it('phone password', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPasswordMock.mockResolvedValueOnce({ id: 'foo', isSuspended: false });

    const identifier = {
      phone: 'phone',
      password: 'password',
    };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const result = await identifierPayloadVerification(ctx, new Provider(''));
    expect(findUserByIdentifier).toBeCalledWith({ phone: 'phone' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(result).toEqual({
      event: Event.SignIn,
      identifiers: [{ key: 'accountId', value: 'foo' }],
    });
  });

  it('email passcode', async () => {
    const identifier = { email: 'email', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const result = await identifierPayloadVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.SignIn },
      'jti',
      log
    );

    expect(result).toEqual({
      event: Event.SignIn,
      identifiers: [{ key: 'emailVerified', value: identifier.email }],
    });
  });

  it('phone passcode', async () => {
    const identifier = { phone: 'phone', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const result = await identifierPayloadVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.SignIn },
      'jti',
      log
    );

    expect(result).toEqual({
      event: Event.SignIn,
      identifiers: [{ key: 'phoneVerified', value: identifier.phone }],
    });
  });

  it('social', async () => {
    const identifier = { connectorId: 'logto', connectorData: {} };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const result = await identifierPayloadVerification(ctx, new Provider(''));

    expect(verifySocialIdentity).toBeCalledWith(identifier, log);
    expect(findUserByIdentifierMock).not.toBeCalled();

    expect(result).toEqual({
      event: Event.SignIn,
      identifiers: [
        { key: 'social', connectorId: identifier.connectorId, userInfo: { id: 'foo' } },
      ],
    });
  });

  it('verified social email', async () => {
    const interactionRecord: AnonymousInteractionResult = {
      event: Event.SignIn,
      identifiers: [
        {
          key: 'social',
          connectorId: 'logto',
          userInfo: {
            id: 'foo',
            email: 'email@logto.io',
          },
        },
      ],
    };

    const identifierPayload = { connectorId: 'logto', identityType: 'email' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier: identifierPayload,
      }),
    };

    const result = await identifierPayloadVerification(ctx, new Provider(''), interactionRecord);
    expect(result).toEqual({
      event: Event.SignIn,
      identifiers: [
        {
          key: 'social',
          connectorId: 'logto',
          userInfo: {
            id: 'foo',
            email: 'email@logto.io',
          },
        },
        {
          key: 'emailVerified',
          value: 'email@logto.io',
        },
      ],
    });
  });

  it('verified social email should throw if social session not found', async () => {
    const identifierPayload = { connectorId: 'logto', identityType: 'email' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier: identifierPayload,
      }),
    };

    await expect(identifierPayloadVerification(ctx, new Provider(''))).rejects.toMatchError(
      new RequestError('session.connector_session_not_found')
    );
  });

  it('verified social email should throw if social identity not found', async () => {
    const interactionRecord: AnonymousInteractionResult = {
      event: Event.SignIn,
      identifiers: [
        {
          key: 'social',
          connectorId: 'logto',
          userInfo: {
            id: 'foo',
          },
        },
      ],
    };

    const identifierPayload = { connectorId: 'logto', identityType: 'email' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier: identifierPayload,
      }),
    };

    await expect(
      identifierPayloadVerification(ctx, new Provider(''), interactionRecord)
    ).rejects.toMatchError(new RequestError('session.connector_session_not_found'));
  });

  it('should merge identifier if exist', async () => {
    const identifier = { email: 'email', passcode: 'passcode' };
    const oldIdentifier: VerifiedPhoneIdentifier = { key: 'phoneVerified', value: '123456' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const result = await identifierPayloadVerification(ctx, new Provider(''), {
      event: Event.Register,
      identifiers: [oldIdentifier],
    });

    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.SignIn },
      'jti',
      log
    );

    expect(result).toEqual({
      event: Event.SignIn,
      identifiers: [oldIdentifier, { key: 'emailVerified', value: identifier.email }],
    });
  });
});
