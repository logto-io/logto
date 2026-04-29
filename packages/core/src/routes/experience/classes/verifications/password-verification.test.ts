import {
  AdditionalIdentifier,
  SignInIdentifier,
  type SignInExperience,
  type User,
  type VerificationIdentifier,
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
        reminderPeriodDays: 5,
      },
    } satisfies SignInExperience);

    const verification = createVerification();

    await expect(verification.verify(password)).resolves.toEqual(expiredUser);
    expect(verification.isVerified).toBe(true);
    await expect(verification.verifyPasswordExpiration(expiredUser)).rejects.toMatchError(
      new RequestError({ code: 'password.expired', status: 422 })
    );
  });

  it('should return reminder metadata when password is in reminder window', async () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 28 * dayInMs,
    } satisfies User;

    findUserByUsername.mockResolvedValueOnce(user);
    verifyUserPassword.mockResolvedValueOnce(user);
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      },
    } satisfies SignInExperience);

    const verification = createVerification();

    await expect(verification.verify(password)).resolves.toEqual(user);
    await expect(verification.verifyPasswordExpiration(user)).resolves.toEqual({
      kind: 'reminder',
      user,
      reminder: {
        daysUntilExpiration: 2,
      },
    });
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
        reminderPeriodDays: 5,
      },
    } satisfies SignInExperience);

    const verification = createVerification();

    await expect(verification.verify(password)).resolves.toEqual(user);
    await expect(verification.verifyPasswordExpiration(user)).rejects.toMatchError(
      new RequestError({ code: 'password.expired', status: 422 })
    );
  });

  it('should throw 500 when password expiration is enabled without validPeriodDays', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
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
        status: 500,
      })
    );
    expect(findUserById).toHaveBeenCalledWith(mockUser.id);
  });
});
