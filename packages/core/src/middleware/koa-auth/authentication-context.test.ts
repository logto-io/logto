import { LogtoAcr } from '@logto/schemas';

import {
  buildInsufficientUserAuthenticationChallenge,
  escapeQuotedString,
  isAuthenticationContextFresh,
  maximumAuthenticationAgeInSeconds,
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
    ['an authentication at the end of the window', maximumAuthenticationAgeInSeconds],
  ])('should accept %s', (_, ageInSeconds) => {
    expect(isAuthenticationContextFresh(nowInSeconds - ageInSeconds, now)).toBe(true);
  });

  it('should reject an authentication one second past the window', () => {
    expect(
      isAuthenticationContextFresh(nowInSeconds - maximumAuthenticationAgeInSeconds - 1, now)
    ).toBe(false);
  });

  it('should reject a timestamp in the future', () => {
    expect(isAuthenticationContextFresh(nowInSeconds + 1, now)).toBe(false);
  });
});

describe('satisfiesAuthenticationContextPolicy()', () => {
  it('should accept a fresh first-factor context', () => {
    expect(satisfiesAuthenticationContextPolicy(buildExtra(), now)).toBe(true);
  });

  it('should accept a fresh MFA context, which satisfies the first-factor class', () => {
    expect(satisfiesAuthenticationContextPolicy(buildExtra({ acr: LogtoAcr.Mfa }), now)).toBe(true);
  });

  it('should accept a context that carries unrelated claims, such as token exchange extras', () => {
    expect(
      satisfiesAuthenticationContextPolicy(
        { ...buildExtra(), amr: ['pwd'], organization_id: 'organization' },
        now
      )
    ).toBe(true);
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
    expect(satisfiesAuthenticationContextPolicy(extra, now)).toBe(false);
  });
});

describe('escapeQuotedString()', () => {
  it('should escape backslashes and double quotes, and leave other characters alone', () => {
    expect(escapeQuotedString('a\\b"c d')).toBe('a\\\\b\\"c d');
  });
});

describe('buildInsufficientUserAuthenticationChallenge()', () => {
  it('should build the RFC 9470 challenge that asks for the Account API policy', () => {
    expect(buildInsufficientUserAuthenticationChallenge()).toBe(
      'Bearer error="insufficient_user_authentication", ' +
        'error_description="Recent user authentication is required", ' +
        'acr_values="urn:logto:acr:1fa", max_age="600"'
    );
  });
});
