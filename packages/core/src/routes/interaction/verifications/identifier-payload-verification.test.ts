import crypto from 'node:crypto';

import { PasswordPolicyChecker } from '@logto/core-kit';
import { InteractionEvent } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { AnonymousInteractionResult } from '../types/index.js';

const { jest } = import.meta;
const { mockEsm, mockEsmDefault, mockEsmWithActual } = createMockUtils(jest);

const findUserByIdentifier = mockEsmDefault('../utils/find-user-by-identifier.js', () => jest.fn());

await mockEsmWithActual('../utils/interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));

const { verifySsoOnlyEmailIdentifier } = mockEsm('../utils/single-sign-on-guard.js', () => ({
  verifySsoOnlyEmailIdentifier: jest.fn(),
}));

const { verifyIdentifierByVerificationCode } = mockEsm(
  '../utils/verification-code-validation.js',
  () => ({
    verifyIdentifierByVerificationCode: jest.fn(),
  })
);

const { verifySocialIdentity } = mockEsm('../utils/social-verification.js', () => ({
  verifySocialIdentity: jest.fn().mockResolvedValue({ id: 'foo' }),
}));

const identifierPayloadVerification = await pickDefault(
  import('./identifier-payload-verification.js')
);

const verifyUserPassword = jest.fn();
const logContext = createMockLogContext();
const tenant = new MockTenant(undefined, undefined, undefined, {
  users: { verifyUserPassword },
});

describe('identifier verification', () => {
  const baseCtx = {
    ...createContextWithRouteParameters(),
    ...logContext,
    signInExperience: mockSignInExperience,
    passwordPolicyChecker: new PasswordPolicyChecker(
      mockSignInExperience.passwordPolicy,
      crypto.subtle
    ),
  };

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
      identifierPayloadVerification(baseCtx, tenant, identifier, interactionStorage)
    ).rejects.toThrow();
    expect(findUserByIdentifier).toBeCalledWith(tenant, { username: 'username' });
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
      identifierPayloadVerification(baseCtx, tenant, identifier, interactionStorage)
    ).rejects.toMatchError(new RequestError({ code: 'user.suspended', status: 401 }));

    expect(findUserByIdentifier).toBeCalledWith(tenant, { username: 'username' });
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
      tenant,
      identifier,
      interactionStorage
    );
    expect(findUserByIdentifier).toBeCalledWith(tenant, { email: 'email' });
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
      tenant,
      identifier,
      interactionStorage
    );
    expect(findUserByIdentifier).toBeCalledWith(tenant, { phone: 'phone' });
    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(result).toEqual({ key: 'accountId', value: 'foo' });
  });

  it('email verificationCode', async () => {
    const identifier = { email: 'email', verificationCode: 'verificationCode' };

    const result = await identifierPayloadVerification(
      baseCtx,
      tenant,
      identifier,
      interactionStorage
    );
    expect(verifyIdentifierByVerificationCode).toBeCalledWith(
      { ...identifier, event: interactionStorage.event },
      'jti',
      logContext.createLog,
      tenant.libraries.passcodes
    );

    expect(result).toEqual({ key: 'emailVerified', value: identifier.email });
  });

  it('phone verificationCode', async () => {
    const identifier = { phone: 'phone', verificationCode: 'verificationCode' };

    const result = await identifierPayloadVerification(
      baseCtx,
      tenant,
      identifier,
      interactionStorage
    );

    expect(verifyIdentifierByVerificationCode).toBeCalledWith(
      { ...identifier, event: interactionStorage.event },
      'jti',
      logContext.createLog,
      tenant.libraries.passcodes
    );

    expect(result).toEqual({ key: 'phoneVerified', value: identifier.phone });
  });

  it('social', async () => {
    const identifier = { connectorId: 'logto', connectorData: {} };

    const result = await identifierPayloadVerification(
      baseCtx,
      tenant,
      identifier,
      interactionStorage
    );

    expect(verifySocialIdentity).toBeCalledWith(identifier, baseCtx, tenant);
    expect(findUserByIdentifier).not.toBeCalled();

    expect(result).toEqual({
      key: 'social',
      connectorId: identifier.connectorId,
      userInfo: { id: 'foo' },
    });
  });

  it('should throw if social email is SSO only', async () => {
    const identifier = { connectorId: 'logto', connectorData: {} };
    const useInfo = { id: 'foo', email: 'foo@example.com' };

    verifySsoOnlyEmailIdentifier.mockRejectedValueOnce(new RequestError('session.sso_enabled'));
    verifySocialIdentity.mockResolvedValueOnce(useInfo);

    await expect(async () =>
      identifierPayloadVerification(baseCtx, tenant, identifier, interactionStorage)
    ).rejects.toMatchError(new RequestError('session.sso_enabled'));

    expect(verifySocialIdentity).toBeCalledWith(identifier, baseCtx, tenant);
    expect(verifySsoOnlyEmailIdentifier).toBeCalledWith(
      tenant.libraries.ssoConnectors,
      useInfo,
      mockSignInExperience
    );
    expect(findUserByIdentifier).not.toBeCalled();
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

    const identifierPayload = Object.freeze({ connectorId: 'logto', email: 'email@logto.io' });

    const result = await identifierPayloadVerification(
      baseCtx,
      tenant,
      identifierPayload,
      interactionRecord
    );

    expect(result).toEqual({
      key: 'emailVerified',
      value: 'email@logto.io',
    });
  });

  it('verified social email should throw if social session not found', async () => {
    const identifierPayload = Object.freeze({ connectorId: 'logto', email: 'email@logto.io' });

    await expect(
      identifierPayloadVerification(baseCtx, tenant, identifierPayload, interactionStorage)
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
            email: 'email@googl.io',
          },
        },
      ],
    };

    const identifierPayload = Object.freeze({ connectorId: 'logto', email: 'email@logto.io' });

    await expect(
      identifierPayloadVerification(baseCtx, tenant, identifierPayload, interactionRecord)
    ).rejects.toMatchError(new RequestError('session.connector_session_not_found'));
  });
});
