import { Event } from '@logto/schemas';
import { mockEsm, mockEsmDefault, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { AnonymousInteractionResult, VerifiedPhoneIdentifier } from '../types/index.js';

const { jest } = import.meta;

const { verifyUserPassword } = mockEsm('#src/lib/user.js', () => ({
  verifyUserPassword: jest.fn(),
}));

const findUserByIdentifier = mockEsmDefault('../utils/find-user-by-identifier.js', () => jest.fn());

await mockEsmWithActual('../utils/interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));

const { verifyIdentifierByPasscode } = mockEsm('../utils/passcode-validation.js', () => ({
  verifyIdentifierByPasscode: jest.fn(),
}));

const { verifySocialIdentity } = mockEsm('../utils/social-verification.js', () => ({
  verifySocialIdentity: jest.fn().mockResolvedValue({ id: 'foo' }),
}));

const identifierPayloadVerification = await pickDefault(
  import('./identifier-payload-verification.js')
);

const log = jest.fn();

describe('identifier verification', () => {
  const baseCtx = { ...createContextWithRouteParameters(), log };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username password user not found', async () => {
    findUserByIdentifier.mockResolvedValueOnce(null);

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

    await expect(identifierPayloadVerification(ctx, createMockProvider())).rejects.toThrow();
    expect(findUserByIdentifier).toBeCalledWith({ username: 'username' });
    expect(verifyUserPassword).toBeCalledWith(null, 'password');
  });

  it('username password user is suspended', async () => {
    findUserByIdentifier.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPassword.mockResolvedValueOnce({ id: 'foo', isSuspended: true });
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

    await expect(identifierPayloadVerification(ctx, createMockProvider())).rejects.toMatchError(
      new RequestError({ code: 'user.suspended', status: 401 })
    );

    expect(findUserByIdentifier).toBeCalledWith({ username: 'username' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
  });

  it('email password', async () => {
    findUserByIdentifier.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPassword.mockResolvedValueOnce({ id: 'foo', isSuspended: false });

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

    const result = await identifierPayloadVerification(ctx, createMockProvider());
    expect(findUserByIdentifier).toBeCalledWith({ email: 'email' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(result).toEqual({
      event: Event.SignIn,
      identifiers: [{ key: 'accountId', value: 'foo' }],
    });
  });

  it('phone password', async () => {
    findUserByIdentifier.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPassword.mockResolvedValueOnce({ id: 'foo', isSuspended: false });

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

    const result = await identifierPayloadVerification(ctx, createMockProvider());
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

    const result = await identifierPayloadVerification(ctx, createMockProvider());
    expect(verifyIdentifierByPasscode).toBeCalledWith(
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

    const result = await identifierPayloadVerification(ctx, createMockProvider());
    expect(verifyIdentifierByPasscode).toBeCalledWith(
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

    const result = await identifierPayloadVerification(ctx, createMockProvider());

    expect(verifySocialIdentity).toBeCalledWith(identifier, log);
    expect(findUserByIdentifier).not.toBeCalled();

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

    const result = await identifierPayloadVerification(
      ctx,
      createMockProvider(),
      interactionRecord
    );
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

    await expect(identifierPayloadVerification(ctx, createMockProvider())).rejects.toMatchError(
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
      identifierPayloadVerification(ctx, createMockProvider(), interactionRecord)
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

    const result = await identifierPayloadVerification(ctx, createMockProvider(), {
      event: Event.Register,
      identifiers: [oldIdentifier],
    });

    expect(verifyIdentifierByPasscode).toBeCalledWith(
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
