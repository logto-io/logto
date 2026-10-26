import { LogtoAcr, defaultMaximumAuthenticationAgeInSeconds } from '@logto/schemas';
import { HTTPError, type NormalizedOptions } from 'ky';

import { accountStorage, sessionStorage as accountSessionStorage } from './session-storage';
import {
  completePendingStepUp,
  consumePendingStepUpAction,
  getAccountApiStepUpChallenge,
  getProactiveStepUpChallenge,
  getStepUpChallenge,
  handlePendingStepUpOnPageLoad,
  hasFreshFirstFactorAuthentication,
  parseStepUpChallenge,
  startPendingStepUp,
} from './step-up';

const defaultChallenge = getAccountApiStepUpChallenge(defaultMaximumAuthenticationAgeInSeconds);

const securityPath = '/account/security';
const pageLoad = (pathname: string, search = '') =>
  handlePendingStepUpOnPageLoad({ pathname, search });

/** The page loads a step-up goes through until the restored route runs the action. */
const completeStepUp = () => {
  // The authorization endpoint redirects back with a code.
  expect(pageLoad('/account', '?code=code&state=state')).toBeUndefined();
  // The callback exchanged the code, then replaced the location with the account root.
  completePendingStepUp();
  expect(pageLoad('/account')).toBeUndefined();
};

const createHttpError = (status: number, headers: Record<string, string> = {}) =>
  new HTTPError(
    {
      status,
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );

describe('parseStepUpChallenge', () => {
  it('reads the requirement from an Account API challenge', () => {
    expect(
      parseStepUpChallenge(
        'Bearer error="insufficient_user_authentication", error_description="Recent user authentication is required", acr_values="urn:logto:acr:mfa urn:logto:acr:1fa", max_age="300"',
        defaultChallenge
      )
    ).toEqual({ acrValues: 'urn:logto:acr:mfa urn:logto:acr:1fa', maxAge: '300' });
  });

  it('unescapes quoted-strings and accepts token values', () => {
    expect(
      parseStepUpChallenge(
        'bearer error=insufficient_user_authentication, error_description="a \\"quoted\\", value", max_age=0',
        defaultChallenge
      )
    ).toEqual({ acrValues: 'urn:logto:acr:1fa', maxAge: '0' });
  });

  it('falls back to the given policy for missing or malformed parameters', () => {
    expect(
      parseStepUpChallenge(
        'Bearer error="insufficient_user_authentication", max_age="-1"',
        getAccountApiStepUpChallenge(7200)
      )
    ).toEqual({ acrValues: 'urn:logto:acr:1fa', maxAge: '7200' });
  });

  it('falls back to the default policy for a challenge without any parameter', () => {
    expect(
      parseStepUpChallenge('Bearer error="insufficient_user_authentication"', defaultChallenge)
    ).toEqual({ acrValues: 'urn:logto:acr:1fa', maxAge: '600' });
  });

  it.each([
    undefined,
    '',
    'Bearer',
    'Bearer error="invalid_token"',
    'Basic error="insufficient_user_authentication"',
    'Bearer error_description="insufficient_user_authentication"',
  ])('ignores %p', (header) => {
    expect(parseStepUpChallenge(header, defaultChallenge)).toBeUndefined();
  });
});

describe('getStepUpChallenge', () => {
  const challenge =
    'Bearer error="insufficient_user_authentication", acr_values="urn:logto:acr:1fa"';

  it('reads the challenge of a 401 response', () => {
    expect(
      getStepUpChallenge(createHttpError(401, { 'www-authenticate': challenge }), defaultChallenge)
    ).toEqual({
      acrValues: 'urn:logto:acr:1fa',
      maxAge: '600',
    });
  });

  it('reads the tenant window from a challenge that advertises it', () => {
    expect(
      getStepUpChallenge(
        createHttpError(401, {
          'www-authenticate':
            'Bearer error="insufficient_user_authentication", acr_values="urn:logto:acr:1fa", max_age="7200"',
        }),
        defaultChallenge
      )
    ).toEqual({ acrValues: 'urn:logto:acr:1fa', maxAge: '7200' });
  });

  it('ignores other statuses, a 401 without the challenge, and non-HTTP errors', () => {
    expect(
      getStepUpChallenge(createHttpError(403, { 'www-authenticate': challenge }), defaultChallenge)
    ).toBeUndefined();
    expect(getStepUpChallenge(createHttpError(401), defaultChallenge)).toBeUndefined();
    expect(getStepUpChallenge(new Error(challenge), defaultChallenge)).toBeUndefined();
  });
});

describe('hasFreshFirstFactorAuthentication', () => {
  const now = 1_800_000_000_000;
  const authTimeOfAge = (ageSeconds: number) => now / 1000 - ageSeconds;

  it.each([undefined, {}, { acr: 'unsupported' }])(
    'rejects a missing or unsupported acr: %p',
    (claims) => {
      expect(hasFreshFirstFactorAuthentication(claims, undefined, now)).toBe(false);
    }
  );

  it.each([
    [0, true],
    [60, true],
    [540, true],
    [541, false],
    [600, false],
    [-30, true],
    [-61, false],
  ])('checks an auth_time age of %p seconds against the default window', (age, expected) => {
    expect(
      hasFreshFirstFactorAuthentication(
        { acr: LogtoAcr.FirstFactor, auth_time: authTimeOfAge(age) },
        defaultMaximumAuthenticationAgeInSeconds,
        now
      )
    ).toBe(expected);
  });

  it('reuses a context that is fresh for a longer tenant window', () => {
    expect(
      hasFreshFirstFactorAuthentication(
        { acr: LogtoAcr.FirstFactor, auth_time: authTimeOfAge(7000) },
        7200,
        now
      )
    ).toBe(true);
  });

  it('reuses a context within the capped margin of the shortest tenant window', () => {
    // A one-minute window keeps a 15-second margin, so the context it has just obtained is reusable
    // and the proactive step-up does not restart authentication for every action.
    expect(
      hasFreshFirstFactorAuthentication(
        { acr: LogtoAcr.FirstFactor, auth_time: authTimeOfAge(45) },
        60,
        now
      )
    ).toBe(true);
    expect(
      hasFreshFirstFactorAuthentication(
        { acr: LogtoAcr.FirstFactor, auth_time: authTimeOfAge(46) },
        60,
        now
      )
    ).toBe(false);
  });

  it('reuses a context obtained a fraction of a second ago at the shortest window', () => {
    // `auth_time` is whole seconds while `now` is a millisecond timestamp, so a just-completed
    // step-up must not be rejected by a fractional age when the threshold is at its minimum.
    const fractionalNow = now + 999;

    expect(
      hasFreshFirstFactorAuthentication(
        { acr: LogtoAcr.FirstFactor, auth_time: Math.floor(fractionalNow / 1000) },
        60,
        fractionalNow
      )
    ).toBe(true);
  });

  it('accepts an mfa context, which also satisfies 1fa', () => {
    expect(
      hasFreshFirstFactorAuthentication(
        { acr: LogtoAcr.Mfa, auth_time: authTimeOfAge(60) },
        undefined,
        now
      )
    ).toBe(true);
  });

  it('rejects a non-numeric auth_time', () => {
    expect(
      hasFreshFirstFactorAuthentication(
        { acr: LogtoAcr.FirstFactor, auth_time: String(authTimeOfAge(60)) },
        undefined,
        now
      )
    ).toBe(false);
  });
});

describe('step-up challenges', () => {
  it('aligns the proactive max_age with the client freshness threshold', () => {
    expect(getProactiveStepUpChallenge(defaultMaximumAuthenticationAgeInSeconds)).toEqual({
      acrValues: LogtoAcr.FirstFactor,
      maxAge: '540',
    });
  });

  it('aligns the proactive max_age with a configured tenant window', () => {
    expect(getProactiveStepUpChallenge(7200)).toEqual({
      acrValues: LogtoAcr.FirstFactor,
      maxAge: '7140',
    });
  });

  it('keeps the proactive max_age positive for the shortest tenant window', () => {
    expect(getProactiveStepUpChallenge(60)).toEqual({
      acrValues: LogtoAcr.FirstFactor,
      maxAge: '45',
    });
  });

  it('keeps the tenant policy for the challenge fallback', () => {
    expect(getAccountApiStepUpChallenge(7200)).toEqual({
      acrValues: LogtoAcr.FirstFactor,
      maxAge: '7200',
    });
  });
});

describe('pending step-up', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resumes the action once after the step-up callback', () => {
    startPendingStepUp({ type: 'remove-social', connectorId: 'google' }, securityPath);
    completeStepUp();

    expect(consumePendingStepUpAction(['remove-username'])).toBeUndefined();
    expect(consumePendingStepUpAction(['remove-social'])).toEqual({
      type: 'remove-social',
      connectorId: 'google',
    });
    expect(consumePendingStepUpAction(['remove-social'])).toBeUndefined();
  });

  it('does not resume before the restored route loads', () => {
    startPendingStepUp({ type: 'enable-mfa' }, securityPath);
    expect(consumePendingStepUpAction(['enable-mfa'])).toBeUndefined();

    pageLoad('/account', '?code=code&state=state');
    completePendingStepUp();
    expect(consumePendingStepUpAction(['enable-mfa'])).toBeUndefined();
  });

  it('discards an action the restored route did not run on the next page load', () => {
    startPendingStepUp({ type: 'enable-mfa' }, securityPath);
    completeStepUp();

    pageLoad(securityPath);

    expect(consumePendingStepUpAction(['enable-mfa'])).toBeUndefined();
    expect(accountStorage.pendingStepUp.get()).toBeUndefined();
  });

  it.each([
    ['a refresh or browser back', securityPath, ''],
    ['the account root without a callback', '/account', ''],
    ['a callback on another path', securityPath, '?code=code&state=state'],
  ])('discards an abandoned step-up on %s', (_, pathname, search) => {
    startPendingStepUp({ type: 'remove-username' }, securityPath);

    expect(pageLoad(pathname, search)).toBeUndefined();

    completePendingStepUp();
    pageLoad('/account');
    expect(consumePendingStepUpAction(['remove-username'])).toBeUndefined();
  });

  it('returns the OIDC error, restores nothing, and never runs the action', () => {
    startPendingStepUp({ type: 'disable-mfa' }, securityPath);
    accountSessionStorage.setRouteRestore(securityPath);

    expect(pageLoad('/account', '?error=unmet_authentication_requirements&state=state')).toEqual({
      error: 'unmet_authentication_requirements',
      route: securityPath,
    });
    expect(accountSessionStorage.getRouteRestore()).toBeUndefined();

    // A later callback or reload cannot bring the action back.
    completePendingStepUp();
    pageLoad('/account');
    expect(consumePendingStepUpAction(['disable-mfa'])).toBeUndefined();
    expect(pageLoad('/account', '?error=access_denied')).toBeUndefined();
  });

  it('does not report an OIDC error to a page that has no step-up waiting for its callback', () => {
    expect(pageLoad('/account', '?error=access_denied')).toBeUndefined();

    startPendingStepUp({ type: 'disable-mfa' }, securityPath);
    completeStepUp();
    expect(pageLoad('/account', '?error=access_denied')).toBeUndefined();
  });

  it('returns to the account root when the stored route is outside Account Center', () => {
    startPendingStepUp({ type: 'disable-mfa' }, 'https://example.com/account/security');

    expect(pageLoad('/account', '?error=access_denied')).toEqual({
      error: 'access_denied',
      route: '/account',
    });
  });

  it('does not replay an action when the callback page loads again', () => {
    startPendingStepUp({ type: 'revoke-personal-access-token', name: 'ci' }, securityPath);
    pageLoad('/account', '?code=code&state=state');
    completePendingStepUp();

    // The callback URL is loaded a second time, before or after the action ran.
    pageLoad('/account', '?code=code&state=state');
    completePendingStepUp();
    pageLoad('/account');

    expect(consumePendingStepUpAction(['revoke-personal-access-token'])).toBeUndefined();
  });

  it('discards a step-up that has been pending for more than 10 minutes', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    startPendingStepUp({ type: 'load-sessions' }, '/account/sessions');
    pageLoad('/account', '?code=code&state=state');
    completePendingStepUp();

    jest.spyOn(Date, 'now').mockReturnValue(now + 10 * 60 * 1000 + 1);
    pageLoad('/account');

    expect(consumePendingStepUpAction(['load-sessions'])).toBeUndefined();
  });
});
