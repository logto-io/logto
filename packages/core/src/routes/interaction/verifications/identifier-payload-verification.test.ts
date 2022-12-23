import { InteractionEvent } from '@logto/schemas';
import { mockEsm, mockEsmDefault, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { AnonymousInteractionResult } from '../types/index.js';

const { jest } = import.meta;

const { verifyUserPassword } = mockEsm('#src/libraries/user.js', () => ({
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

const logContext = createMockLogContext();

describe('identifier verification', () => {
  const baseCtx = { ...createContextWithRouteParameters(), ...logContext };
  const interactionStorage = { event: InteractionEvent.SignIn };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('username password user not found', async () => {
    findUserByIdentifier.mockResolvedValueOnce(null);

    const identifier = {
      username: 'username',
      password: 'password',
    };

    await expect(
      identifierPayloadVerification(baseCtx, createMockProvider(), identifier, interactionStorage)
    ).rejects.toThrow();
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

    await expect(
      identifierPayloadVerification(baseCtx, createMockProvider(), identifier, interactionStorage)
    ).rejects.toMatchError(new RequestError({ code: 'user.suspended', status: 401 }));

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

    const result = await identifierPayloadVerification(
      baseCtx,
      createMockProvider(),
      identifier,
      interactionStorage
    );
    expect(findUserByIdentifier).toBeCalledWith({ email: 'email' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(result).toEqual({ key: 'accountId', value: 'foo' });
  });

  it('phone password', async () => {
    findUserByIdentifier.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPassword.mockResolvedValueOnce({ id: 'foo', isSuspended: false });

    const identifier = {
      phone: 'phone',
      password: 'password',
    };

    const result = await identifierPayloadVerification(
      baseCtx,
      createMockProvider(),
      identifier,
      interactionStorage
    );
    expect(findUserByIdentifier).toBeCalledWith({ phone: 'phone' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(result).toEqual({ key: 'accountId', value: 'foo' });
  });

  it('email passcode', async () => {
    const identifier = { email: 'email', passcode: 'passcode' };

    const result = await identifierPayloadVerification(
      baseCtx,
      createMockProvider(),
      identifier,
      interactionStorage
    );
    expect(verifyIdentifierByPasscode).toBeCalledWith(
      { ...identifier, event: interactionStorage.event },
      'jti',
      logContext.createLog
    );

    expect(result).toEqual({ key: 'emailVerified', value: identifier.email });
  });

  it('phone passcode', async () => {
    const identifier = { phone: 'phone', passcode: 'passcode' };

    const result = await identifierPayloadVerification(
      baseCtx,
      createMockProvider(),
      identifier,
      interactionStorage
    );

    expect(verifyIdentifierByPasscode).toBeCalledWith(
      { ...identifier, event: interactionStorage.event },
      'jti',
      logContext.createLog
    );

    expect(result).toEqual({ key: 'phoneVerified', value: identifier.phone });
  });

  it('social', async () => {
    const identifier = { connectorId: 'logto', connectorData: {} };

    const provider = createMockProvider();
    const result = await identifierPayloadVerification(
      baseCtx,
      provider,
      identifier,
      interactionStorage
    );

    expect(verifySocialIdentity).toBeCalledWith(identifier, baseCtx, provider);
    expect(findUserByIdentifier).not.toBeCalled();

    expect(result).toEqual({
      key: 'social',
      connectorId: identifier.connectorId,
      userInfo: { id: 'foo' },
    });
  });

  it('verified social email', async () => {
    const interactionRecord: AnonymousInteractionResult = {
      event: InteractionEvent.SignIn,
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

    const identifierPayload = Object.freeze({ connectorId: 'logto', identityType: 'email' });

    const result = await identifierPayloadVerification(
      baseCtx,
      createMockProvider(),
      identifierPayload,
      interactionRecord
    );
    expect(result).toEqual({
      key: 'emailVerified',
      value: 'email@logto.io',
    });
  });

  it('verified social email should throw if social session not found', async () => {
    const identifierPayload = Object.freeze({ connectorId: 'logto', identityType: 'email' });

    await expect(
      identifierPayloadVerification(
        baseCtx,
        createMockProvider(),
        identifierPayload,
        interactionStorage
      )
    ).rejects.toMatchError(new RequestError('session.connector_session_not_found'));
  });

  it('verified social email should throw if social identity not found', async () => {
    const interactionRecord: AnonymousInteractionResult = {
      event: InteractionEvent.SignIn,
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

    const identifierPayload = Object.freeze({ connectorId: 'logto', identityType: 'email' });

    await expect(
      identifierPayloadVerification(
        baseCtx,
        createMockProvider(),
        identifierPayload,
        interactionRecord
      )
    ).rejects.toMatchError(new RequestError('session.connector_session_not_found'));
  });
});
