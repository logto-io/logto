import { LogtoAcr, defaultMaximumAuthenticationAgeInSeconds } from '@logto/schemas';

import {
  buildInsufficientUserAuthenticationChallenge,
  escapeQuotedString,
  isAuthenticationContextFresh,
  satisfiesAuthenticationContextPolicy,
} from './authentication-context.js';

const now = 1_800_000_000_000;
const nowInSeconds = now / 1000;

const buildExtra = (overrides: Record<string, unknown> = {}) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: nowInSeconds,
  ...overrides,
});

describe('isAuthenticationContextFresh()', () => {
  it.each([
    ['a just-completed authentication', 0],
    [
      'an authentication at the end of the default window',
      defaultMaximumAuthenticationAgeInSeconds,
    ],
  ])('should accept %s', (_, ageInSeconds) => {
    expect(
      isAuthenticationContextFresh(
        nowInSeconds - ageInSeconds,
        defaultMaximumAuthenticationAgeInSeconds,
        now
      )
    ).toBe(true);
  });

  it('should reject an authentication one second past the default window', () => {
    expect(
      isAuthenticationContextFresh(
        nowInSeconds - defaultMaximumAuthenticationAgeInSeconds - 1,
        defaultMaximumAuthenticationAgeInSeconds,
        now
      )
    ).toBe(false);
  });

  it.each([
    ['the shortest tenant window', 60, 60, true],
    ['the shortest tenant window, one second late', 61, 60, false],
    ['a two-hour tenant window', 7200, 7200, true],
    ['a two-hour tenant window, one second late', 7201, 7200, false],
  ])(
    'should apply %s to the boundary',
    (_, ageInSeconds, maximumAuthenticationAgeInSeconds, expected) => {
      expect(
        isAuthenticationContextFresh(
          nowInSeconds - ageInSeconds,
          maximumAuthenticationAgeInSeconds,
          now
        )
      ).toBe(expected);
    }
  );

  it('should reject a timestamp in the future', () => {
    expect(
      isAuthenticationContextFresh(nowInSeconds + 1, defaultMaximumAuthenticationAgeInSeconds, now)
    ).toBe(false);
  });
});

describe('satisfiesAuthenticationContextPolicy()', () => {
  const maximumAuthenticationAgeInSeconds = defaultMaximumAuthenticationAgeInSeconds;

  it('should accept a fresh first-factor context', () => {
    expect(
      satisfiesAuthenticationContextPolicy(buildExtra(), maximumAuthenticationAgeInSeconds, now)
    ).toBe(true);
  });

  it('should accept a fresh MFA context, which satisfies the first-factor class', () => {
    expect(
      satisfiesAuthenticationContextPolicy(
        buildExtra({ acr: LogtoAcr.Mfa }),
        maximumAuthenticationAgeInSeconds,
        now
      )
    ).toBe(true);
  });

  it('should accept a context that carries unrelated claims, such as token exchange extras', () => {
    expect(
      satisfiesAuthenticationContextPolicy(
        { ...buildExtra(), amr: ['pwd'], organization_id: 'organization' },
        maximumAuthenticationAgeInSeconds,
        now
      )
    ).toBe(true);
  });

  it('should accept a context that is only fresh for a longer tenant window', () => {
    expect(
      satisfiesAuthenticationContextPolicy(
        buildExtra({ auth_time: nowInSeconds - 7000 }),
        7200,
        now
      )
    ).toBe(true);
  });

  it('should reject a context that is stale for a shorter tenant window', () => {
    expect(
      satisfiesAuthenticationContextPolicy(buildExtra({ auth_time: nowInSeconds - 61 }), 60, now)
    ).toBe(false);
  });

  it.each([
    ['a stale authentication', buildExtra({ auth_time: nowInSeconds - 601 })],
    ['a missing `acr`', { auth_time: nowInSeconds }],
    ['a missing `auth_time`', { acr: LogtoAcr.FirstFactor }],
    ['an `acr` that is not a string', buildExtra({ acr: [LogtoAcr.FirstFactor] })],
    ['an `acr` that is not a Logto ACR', buildExtra({ acr: 'urn:example:acr:1fa' })],
    ['a non-integer `auth_time`', buildExtra({ auth_time: nowInSeconds - 0.5 })],
    ['a string `auth_time`', buildExtra({ auth_time: `${nowInSeconds}` })],
    ['a future `auth_time`', buildExtra({ auth_time: nowInSeconds + 1 })],
    ['no extra at all', undefined],
    ['an empty extra', {}],
  ])('should reject %s', (_, extra) => {
    expect(
      satisfiesAuthenticationContextPolicy(extra, maximumAuthenticationAgeInSeconds, now)
    ).toBe(false);
  });
});

describe('escapeQuotedString()', () => {
  it('should escape backslashes and double quotes, and leave other characters alone', () => {
    expect(escapeQuotedString('a\\b"c d')).toBe('a\\\\b\\"c d');
  });
});

describe('buildInsufficientUserAuthenticationChallenge()', () => {
  it('should build the RFC 9470 challenge that asks for the default policy', () => {
    expect(buildInsufficientUserAuthenticationChallenge()).toBe(
      'Bearer error="insufficient_user_authentication", ' +
        'error_description="Recent user authentication is required", ' +
        'acr_values="urn:logto:acr:1fa", max_age="600"'
    );
  });

  it('should advertise the tenant window the request was evaluated against', () => {
    expect(buildInsufficientUserAuthenticationChallenge(7200)).toBe(
      'Bearer error="insufficient_user_authentication", ' +
        'error_description="Recent user authentication is required", ' +
        'acr_values="urn:logto:acr:1fa", max_age="7200"'
    );
  });
});
