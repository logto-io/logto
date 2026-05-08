import { type SignInExperience, type User } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';

import { verifyPasswordExpirationPolicy } from './password-expiration.js';

const { jest } = import.meta;

describe('verifyPasswordExpirationPolicy()', () => {
  const now = new Date('2026-01-10T00:00:00.000Z');
  const dayInMs = 24 * 60 * 60 * 1000;

  const enabledPolicy = {
    enabled: true,
    validPeriodDays: 30,
    reminderPeriodDays: 5,
  } satisfies SignInExperience['passwordExpiration'];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns success when password expiration is disabled', () => {
    expect(verifyPasswordExpirationPolicy({ enabled: false }, mockUser)).toEqual({
      kind: 'success',
      user: mockUser,
    });
  });

  it('throws password.expired when the user is manually expired', () => {
    const user = {
      ...mockUser,
      isPasswordExpired: true,
      passwordUpdatedAt: now.getTime(),
    } satisfies User;

    expect(() => {
      verifyPasswordExpirationPolicy(enabledPolicy, user);
    }).toThrow(new RequestError({ code: 'password.expired', status: 422 }));
  });

  it('throws password.expired when password age reaches the valid period', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 30 * dayInMs,
    } satisfies User;

    expect(() => {
      verifyPasswordExpirationPolicy(enabledPolicy, user);
    }).toThrow(new RequestError({ code: 'password.expired', status: 422 }));
  });

  it('falls back to createdAt when passwordUpdatedAt is not set', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: null,
      createdAt: now.getTime() - 30 * dayInMs,
    } satisfies User;

    expect(() => {
      verifyPasswordExpirationPolicy(enabledPolicy, user);
    }).toThrow(new RequestError({ code: 'password.expired', status: 422 }));
  });

  it('returns reminder metadata when password is in the reminder window', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 28 * dayInMs,
    } satisfies User;

    expect(verifyPasswordExpirationPolicy(enabledPolicy, user)).toEqual({
      kind: 'reminder',
      user,
      reminder: {
        daysUntilExpiration: 2,
      },
    });
  });

  it('returns success when password is outside the reminder window', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 20 * dayInMs,
    } satisfies User;

    expect(verifyPasswordExpirationPolicy(enabledPolicy, user)).toEqual({
      kind: 'success',
      user,
    });
  });

  it('throws when password expiration is enabled without validPeriodDays', () => {
    expect(() => {
      verifyPasswordExpirationPolicy({ enabled: true }, mockUser);
    }).toThrow(
      new RequestError({
        code: 'sign_in_experiences.password_expiration_invalid_period_days',
        status: 500,
      })
    );
  });
});
