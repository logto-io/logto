import crypto from 'node:crypto';

import { PasswordPolicyChecker } from '@logto/core-kit';
import { InteractionEvent, type SignInExperience, type User } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
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

const { verifySsoOnlyEmailIdentifier } = mockEsm(
  '#src/libraries/verification-helpers/single-sign-on-guard.js',
  () => ({
    verifySsoOnlyEmailIdentifier: jest.fn(),
  })
);

const { verifyIdentifierByVerificationCode } = mockEsm(
  '../utils/verification-code-validation.js',
  () => ({
    verifyIdentifierByVerificationCode: jest.fn(),
  })
);

const { verifySocialIdentity } = mockEsm(
  '#src/libraries/verification-helpers/social-verification.js',
  () => ({
    verifySocialIdentity: jest.fn().mockResolvedValue({ id: 'foo' }),
  })
);

const identifierPayloadVerification = await pickDefault(
  import('./identifier-payload-verification.js')
);

const verifyUserPassword = jest.fn();
const findUserById = jest.fn();
const findDefaultSignInExperience = jest.fn();
const logContext = createMockLogContext();
const tenant = new MockTenant(
  undefined,
  {
    users: { findUserById },
    signInExperiences: { findDefaultSignInExperience },
  },
  undefined,
  {
    users: { verifyUserPassword },
  }
);
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

describe('identifier verification', () => {
  const now = new Date('2026-01-10T00:00:00.000Z');
  const dayInMs = 24 * 60 * 60 * 1000;
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

  beforeEach(() => {
    findUserById.mockResolvedValue(mockUser);
    findDefaultSignInExperience.mockResolvedValue(mockSignInExperience);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for password expiration feature-gate tests.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = true;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after password expiration feature-gate tests.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
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

  it('should throw password.expired for password sign-in when the user is manually expired', async () => {
    const expiredUser = {
      ...mockUser,
      isPasswordExpired: true,
    } satisfies User;

    findUserByIdentifier.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPassword.mockResolvedValueOnce({ id: 'foo', isSuspended: false });
    findUserById.mockResolvedValueOnce(expiredUser);
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      },
    } satisfies SignInExperience);

    const identifier = {
      email: 'email',
      password: 'password',
    };

    await expect(
      identifierPayloadVerification(baseCtx, tenant, identifier, interactionStorage)
    ).rejects.toMatchError(new RequestError({ code: 'password.expired', status: 422 }));

    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(findUserById).toHaveBeenCalledWith('foo');
  });

  it('should ignore password expiration for password sign-in when dev features are disabled', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = false;
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

    expect(result).toEqual({ key: 'accountId', value: 'foo' });
    expect(findDefaultSignInExperience).not.toHaveBeenCalled();
    expect(findUserById).not.toHaveBeenCalled();
  });

  it('should throw password.expired for password sign-in when password age exceeds the policy', async () => {
    jest.useFakeTimers().setSystemTime(now);

    const expiredUser = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 30 * dayInMs,
    } satisfies User;

    findUserByIdentifier.mockResolvedValueOnce({ id: 'foo' });
    verifyUserPassword.mockResolvedValueOnce({ id: 'foo', isSuspended: false });
    findUserById.mockResolvedValueOnce(expiredUser);
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      },
    } satisfies SignInExperience);

    const identifier = {
      email: 'email',
      password: 'password',
    };

    await expect(
      identifierPayloadVerification(baseCtx, tenant, identifier, interactionStorage)
    ).rejects.toMatchError(new RequestError({ code: 'password.expired', status: 422 }));

    expect(verifyUserPassword).toBeCalledWith({ id: 'foo' }, 'password');
    expect(findUserById).toHaveBeenCalledWith('foo');
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
