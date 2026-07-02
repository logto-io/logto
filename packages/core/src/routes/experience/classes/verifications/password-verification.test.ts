import {
  AdditionalIdentifier,
  SignInIdentifier,
  type SignInExperience,
  type User,
  type VerificationIdentifier,
  VerificationType,
} from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { PasswordVerification } from './password-verification.js';

const { jest } = import.meta;

describe('PasswordVerification', () => {
  const password = 'Password123!';
  const now = new Date('2026-01-10T00:00:00.000Z');
  const dayInMs = 24 * 60 * 60 * 1000;
  const verificationId = 'password_verification_id';

  const findUserById = jest.fn();
  const findUserByUsername = jest.fn();
  const findDefaultSignInExperience = jest.fn();
  const verifyUserPassword = jest.fn();

  const tenant = new MockTenant(
    undefined,
    {
      users: {
        findUserById,
        findUserByUsername,
      },
      signInExperiences: {
        findDefaultSignInExperience,
      },
    },
    undefined,
    {
      users: {
        verifyUserPassword,
      },
    }
  );

  const createVerification = (identifier?: VerificationIdentifier) =>
    PasswordVerification.create(
      tenant.libraries,
      tenant.queries,
      identifier ?? {
        type: SignInIdentifier.Username,
        value: mockUser.username ?? 'username',
      }
    );

  const createVerifiedVerification = (identifier?: VerificationIdentifier) =>
    new PasswordVerification(tenant.libraries, tenant.queries, {
      id: verificationId,
      type: VerificationType.Password,
      identifier: identifier ?? {
        type: SignInIdentifier.Username,
        value: mockUser.username ?? 'username',
      },
      verified: true,
    });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    jest.clearAllMocks();

    findUserByUsername.mockResolvedValue(mockUser);
    findUserById.mockResolvedValue(mockUser);
    verifyUserPassword.mockResolvedValue(mockUser);
    findDefaultSignInExperience.mockResolvedValue(mockSignInExperience);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should verify the password and then throw password.expired when user is marked as expired', async () => {
    const expiredUser = {
      ...mockUser,
      isPasswordExpired: true,
      passwordUpdatedAt: now.getTime(),
    } satisfies User;

    findUserByUsername.mockResolvedValueOnce(expiredUser);
    verifyUserPassword.mockResolvedValueOnce(expiredUser);
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
      },
    } satisfies SignInExperience);

    const verification = createVerification();

    await expect(verification.verify(password)).resolves.toEqual(expiredUser);
    expect(verification.isVerified).toBe(true);
    await expect(verification.verifyPasswordExpiration(expiredUser)).rejects.toMatchError(
      new RequestError({ code: 'password.expired', status: 422 })
    );
  });

  it('should not throw when password is still within the valid period', async () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 20 * dayInMs,
    } satisfies User;

    findUserByUsername.mockResolvedValueOnce(user);
    verifyUserPassword.mockResolvedValueOnce(user);
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
      },
    } satisfies SignInExperience);

    const verification = createVerification();

    await expect(verification.verify(password)).resolves.toEqual(user);
    await expect(verification.verifyPasswordExpiration(user)).resolves.toBeUndefined();
    expect(verification.isVerified).toBe(true);
  });

  it('should fall back to createdAt when passwordUpdatedAt is not set', async () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: null,
      createdAt: now.getTime() - 30 * dayInMs,
    } satisfies User;

    findUserByUsername.mockResolvedValueOnce(user);
    verifyUserPassword.mockResolvedValueOnce(user);
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
      },
    } satisfies SignInExperience);

    const verification = createVerification();

    await expect(verification.verify(password)).resolves.toEqual(user);
    await expect(verification.verifyPasswordExpiration(user)).rejects.toMatchError(
      new RequestError({ code: 'password.expired', status: 422 })
    );
  });

  it('should throw 422 when password expiration is enabled without validPeriodDays', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      // @ts-expect-error intentionally testing a persisted malformed policy.
      passwordExpiration: {
        enabled: true,
      },
    } satisfies SignInExperience);

    const verification = createVerification({
      type: AdditionalIdentifier.UserId,
      value: mockUser.id,
    });

    await expect(verification.verify(password)).resolves.toEqual(mockUser);
    await expect(verification.verifyPasswordExpiration(mockUser)).rejects.toMatchError(
      new RequestError({
        code: 'sign_in_experiences.password_expiration_invalid_period_days',
        status: 422,
      })
    );
    expect(findUserById).toHaveBeenCalledWith(mockUser.id);
  });

  it('should identify user by the stored userId when present', async () => {
    const resolvedUserId = 'resolved_user_id';
    const resolvedUser = {
      ...mockUser,
      id: resolvedUserId,
    } satisfies User;
    const verification = createVerification({
      type: SignInIdentifier.Username,
      value: 'original_username',
    });

    findUserById.mockResolvedValueOnce(resolvedUser);

    verification.markAsVerifiedWithUserId(resolvedUserId);

    await expect(verification.identifyUser()).resolves.toEqual(resolvedUser);
    expect(findUserById).toHaveBeenCalledWith(resolvedUserId);
    expect(findUserByUsername).not.toHaveBeenCalled();
  });

  it('should identify normal password verification by identifier', async () => {
    const username = mockUser.username ?? 'username';
    const verification = createVerifiedVerification({
      type: SignInIdentifier.Username,
      value: username,
    });

    await expect(verification.identifyUser()).resolves.toEqual(mockUser);
    expect(findUserByUsername).toHaveBeenCalledWith(username, true);
    expect(findUserById).not.toHaveBeenCalled();
  });

  it('should serialize userId only when present', () => {
    const resolvedUserId = 'resolved_user_id';
    const verification = createVerifiedVerification();

    expect(verification.toJson()).not.toHaveProperty('userId');

    verification.markAsVerifiedWithUserId(resolvedUserId);

    expect(verification.toJson()).toEqual({
      id: verificationId,
      type: VerificationType.Password,
      identifier: {
        type: SignInIdentifier.Username,
        value: mockUser.username ?? 'username',
      },
      verified: true,
      userId: resolvedUserId,
    });
  });
});
