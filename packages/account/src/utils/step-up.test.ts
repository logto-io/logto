import { HTTPError, type NormalizedOptions } from 'ky';

import { accountStorage, sessionStorage as accountSessionStorage } from './session-storage';
import {
  completePendingStepUp,
  consumePendingStepUpAction,
  getStepUpChallenge,
  handlePendingStepUpOnPageLoad,
  parseStepUpChallenge,
  startPendingStepUp,
} from './step-up';

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
        'Bearer error="insufficient_user_authentication", error_description="Recent user authentication is required", acr_values="urn:logto:acr:mfa urn:logto:acr:1fa", max_age="300"'
      )
    ).toEqual({ acrValues: 'urn:logto:acr:mfa urn:logto:acr:1fa', maxAge: '300' });
  });

  it('unescapes quoted-strings and accepts token values', () => {
    expect(
      parseStepUpChallenge(
        'bearer error=insufficient_user_authentication, error_description="a \\"quoted\\", value", max_age=0'
      )
    ).toEqual({ acrValues: 'urn:logto:acr:1fa', maxAge: '0' });
  });

  it('falls back to the Account API policy for missing or malformed parameters', () => {
    expect(
      parseStepUpChallenge('Bearer error="insufficient_user_authentication", max_age="-1"')
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
    expect(parseStepUpChallenge(header)).toBeUndefined();
  });
});

describe('getStepUpChallenge', () => {
  const challenge =
    'Bearer error="insufficient_user_authentication", acr_values="urn:logto:acr:1fa"';

  it('reads the challenge of a 401 response', () => {
    expect(getStepUpChallenge(createHttpError(401, { 'www-authenticate': challenge }))).toEqual({
      acrValues: 'urn:logto:acr:1fa',
      maxAge: '600',
    });
  });

  it('ignores other statuses, a 401 without the challenge, and non-HTTP errors', () => {
    expect(
      getStepUpChallenge(createHttpError(403, { 'www-authenticate': challenge }))
    ).toBeUndefined();
    expect(getStepUpChallenge(createHttpError(401))).toBeUndefined();
    expect(getStepUpChallenge(new Error(challenge))).toBeUndefined();
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
