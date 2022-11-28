import { Provider } from 'oidc-provider';

import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { verifyIdentifierByPasscode } from '../utils/passcode-validation.js';
import {
  verifyUserByIdentityAndPassword,
  verifyUserByVerifiedPasscodeIdentity,
} from '../utils/verify-user.js';
import identifierVerification from './identifier-verification.js';

jest.mock('../utils/verify-user.js', () => ({
  verifyUserByIdentityAndPassword: jest.fn().mockResolvedValue('userId'),
  verifyUserByVerifiedPasscodeIdentity: jest.fn().mockResolvedValue('userId'),
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
  const verifyUserByPasswordMock = verifyUserByIdentityAndPassword as jest.Mock;
  const verifyUserByVerifiedPasscodeIdentityMock =
    verifyUserByVerifiedPasscodeIdentity as jest.Mock;
  const verifyIdentifierByPasscodeMock = verifyIdentifierByPasscode as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username password', async () => {
    const identifier = {
      username: 'username',
      password: 'password',
    };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier,
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyUserByPasswordMock).toBeCalledWith(identifier);
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });

  it('email password', async () => {
    const identifier = {
      email: 'email',
      password: 'password',
    };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier,
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyUserByPasswordMock).toBeCalledWith(identifier);
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });

  it('phone password', async () => {
    const identifier = {
      phone: 'phone',
      password: 'password',
    };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier,
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyUserByPasswordMock).toBeCalledWith(identifier);
    expect(result).toEqual([{ key: 'accountId', value: 'userId' }]);
  });

  it('email passcode with out profile', async () => {
    const identifier = { email: 'email', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier,
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: 'sign-in' },
      'jti',
      log
    );
    expect(verifyUserByVerifiedPasscodeIdentityMock).toBeCalledWith(identifier);

    expect(result).toEqual([
      { key: 'accountId', value: 'userId' },
      { key: 'verifiedEmail', value: 'email' },
    ]);
  });

  it('email passcode with profile', async () => {
    const identifier = { email: 'email', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier,
        profile: {
          email: 'email',
        },
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: 'sign-in' },
      'jti',
      log
    );
    expect(verifyUserByVerifiedPasscodeIdentityMock).not.toBeCalled();

    expect(result).toEqual([{ key: 'verifiedEmail', value: 'email' }]);
  });

  it('phone passcode with out profile', async () => {
    const identifier = { phone: 'phone', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier,
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: 'sign-in' },
      'jti',
      log
    );
    expect(verifyUserByVerifiedPasscodeIdentityMock).toBeCalledWith(identifier);

    expect(result).toEqual([
      { key: 'accountId', value: 'userId' },
      { key: 'verifiedPhone', value: 'phone' },
    ]);
  });

  it('phone passcode with profile', async () => {
    const identifier = { phone: 'phone', passcode: 'passcode' };

    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier,
        profile: {
          phone: 'phone',
        },
      }),
    };

    const result = await identifierVerification(ctx, new Provider(''));
    expect(verifyIdentifierByPasscodeMock).toBeCalledWith(
      { ...identifier, event: 'sign-in' },
      'jti',
      log
    );
    expect(verifyUserByVerifiedPasscodeIdentityMock).not.toBeCalled();

    expect(result).toEqual([{ key: 'verifiedPhone', value: 'phone' }]);
  });
});
