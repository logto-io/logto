import { type SignInExperience, type User } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import { verifyPasswordExpirationPolicy } from './password-expiration.js';

const { jest } = import.meta;
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

describe('verifyPasswordExpirationPolicy()', () => {
  const now = new Date('2026-01-10T00:00:00.000Z');
  const dayInMs = 24 * 60 * 60 * 1000;

  const enabledPolicy = {
    enabled: true,
    validPeriodDays: 30,
  } satisfies SignInExperience['passwordExpiration'];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after each feature-gate test.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
  });

  it('does not throw when password expiration is disabled', () => {
    expect(() => {
      verifyPasswordExpirationPolicy({ enabled: false }, mockUser);
    }).not.toThrow();
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

  it('does not throw when dev features are disabled', () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for this feature-gate test.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = false;

    const user = {
      ...mockUser,
      isPasswordExpired: true,
      passwordUpdatedAt: now.getTime(),
    } satisfies User;

    expect(() => {
      verifyPasswordExpirationPolicy(enabledPolicy, user);
    }).not.toThrow();
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

  it('falls back to createdAt when neither passwordUpdatedAt nor enabledAt is set', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: null,
      createdAt: now.getTime() - 30 * dayInMs,
    } satisfies User;

    expect(() => {
      verifyPasswordExpirationPolicy(enabledPolicy, user);
    }).toThrow(new RequestError({ code: 'password.expired', status: 422 }));
  });

  it('anchors legacy users (no passwordUpdatedAt) on enabledAt instead of createdAt', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: null,
      // Created long ago — would be expired under the createdAt fallback.
      createdAt: now.getTime() - 365 * dayInMs,
    } satisfies User;
    const policy = {
      enabled: true,
      validPeriodDays: 30,
      enabledAt: now.getTime() - 10 * dayInMs,
    } satisfies SignInExperience['passwordExpiration'];

    expect(() => {
      verifyPasswordExpirationPolicy(policy, user);
    }).not.toThrow();
  });

  it('expires legacy users once enabledAt is past the valid period', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: null,
    } satisfies User;
    const policy = {
      enabled: true,
      validPeriodDays: 30,
      enabledAt: now.getTime() - 30 * dayInMs,
    } satisfies SignInExperience['passwordExpiration'];

    expect(() => {
      verifyPasswordExpirationPolicy(policy, user);
    }).toThrow(new RequestError({ code: 'password.expired', status: 422 }));
  });

  it('prefers passwordUpdatedAt over enabledAt', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 5 * dayInMs,
    } satisfies User;
    const policy = {
      enabled: true,
      validPeriodDays: 30,
      // Old enabledAt would expire the password, but the recent passwordUpdatedAt wins.
      enabledAt: now.getTime() - 100 * dayInMs,
    } satisfies SignInExperience['passwordExpiration'];

    expect(() => {
      verifyPasswordExpirationPolicy(policy, user);
    }).not.toThrow();
  });

  it('does not throw when password is still within the valid period', () => {
    const user = {
      ...mockUser,
      passwordUpdatedAt: now.getTime() - 20 * dayInMs,
    } satisfies User;

    expect(() => {
      verifyPasswordExpirationPolicy(enabledPolicy, user);
    }).not.toThrow();
  });

  it('throws when password expiration is enabled without validPeriodDays', () => {
    expect(() => {
      // @ts-expect-error intentionally testing a persisted malformed policy.
      verifyPasswordExpirationPolicy({ enabled: true }, mockUser);
    }).toThrow(
      new RequestError({
        code: 'sign_in_experiences.password_expiration_invalid_period_days',
        status: 422,
      })
    );
  });
});
