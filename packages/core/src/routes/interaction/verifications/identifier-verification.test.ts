import { Event } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { verifyUserPassword } from '#src/lib/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import { assignIdentifierVerificationResult } from '../utils/interaction.js';
import { verifyIdentifierByPasscode } from '../utils/passcode-validation.js';
import identifierVerification from './identifier-verification.js';

jest.mock('#src/lib/user.js', () => ({
  verifyUserPassword: jest.fn(),
}));

jest.mock('../utils/find-user-by-identifier.js', () => jest.fn());

jest.mock('../utils/interaction.js', () => ({
  assignIdentifierVerificationResult: jest.fn(),
}));

jest.mock('../utils/passcode-validation.js', () => ({
  verifyIdentifierByPasscode: jest.fn(),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(async () => ({ params: {}, jti: 'jti' })),
  })),
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

    await expect(identifierVerification(ctx, new Provider(''))).rejects.toThrow();
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

    await expect(identifierVerification(ctx, new Provider(''))).rejects.toThrow();
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

    const result = await identifierVerification(ctx, new Provider(''));
    expect(findUserByIdentifier).toBeCalledWith({ email: 'email' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(result).toEqual([{ key: 'accountId', value: 'foo' }]);
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

    const result = await identifierVerification(ctx, new Provider(''));
    expect(findUserByIdentifier).toBeCalledWith({ phone: 'phone' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(result).toEqual([{ key: 'accountId', value: 'foo' }]);
  });

  it('email passcode with no profile', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });
    const identifier = { email: 'email', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.SignIn },
      'jti',
      log
    );
    expect(findUserByIdentifier).toBeCalledWith(identifier);

    expect(result).toEqual([
      { key: 'accountId', value: 'foo' },
      { key: 'verifiedEmail', value: 'email' },
    ]);
  });

  it('email passcode with no profile and no user should throw and assign interaction', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce(null);
    const identifier = { email: 'email', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const provider = new Provider('');

    await expect(identifierVerification(ctx, provider)).rejects.toThrow();
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.SignIn },
      'jti',
      log
    );
    expect(findUserByIdentifier).toBeCalledWith(identifier);
    expect(assignIdentifierVerificationResult).toBeCalledWith(
      {
        event: Event.SignIn,
        identifiers: [{ key: 'verifiedEmail', value: 'email' }],
      },
      ctx,
      provider
    );
  });

  it('forgot password email passcode with no profile and no user should throw', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce(null);
    const identifier = { email: 'email', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.ForgotPassword,
        identifier,
      }),
    };

    const provider = new Provider('');

    await expect(identifierVerification(ctx, provider)).rejects.toThrow();
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.ForgotPassword },
      'jti',
      log
    );
    expect(findUserByIdentifier).toBeCalledWith(identifier);
    expect(assignIdentifierVerificationResult).not.toBeCalled();
  });

  it('email passcode with profile', async () => {
    const identifier = { email: 'email', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
        profile: {
          email: 'email',
        },
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.SignIn },
      'jti',
      log
    );
    expect(findUserByIdentifierMock).not.toBeCalled();

    expect(result).toEqual([{ key: 'verifiedEmail', value: 'email' }]);
  });

  it('phone passcode with no profile', async () => {
    findUserByIdentifierMock.mockResolvedValueOnce({ id: 'foo' });
    const identifier = { phone: 'phone', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.SignIn },
      'jti',
      log
    );
    expect(findUserByIdentifier).toBeCalledWith(identifier);

    expect(result).toEqual([
      { key: 'accountId', value: 'foo' },
      { key: 'verifiedPhone', value: 'phone' },
    ]);
  });

  it('phone passcode with profile', async () => {
    const identifier = { phone: 'phone', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier,
        profile: {
          phone: 'phone',
        },
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: Event.SignIn },
      'jti',
      log
    );
    expect(findUserByIdentifierMock).not.toBeCalled();

    expect(result).toEqual([{ key: 'verifiedPhone', value: 'phone' }]);
  });
});
