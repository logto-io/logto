/**
 * @file Account Center's OIDC step-up: when the Account API answers a sensitive request with an
 * RFC 9470 `insufficient_user_authentication` challenge, Account Center persists the action, asks
 * the authorization endpoint for the required authentication context, and runs the action again,
 * exactly once, with the elevated token set the callback returns.
 *
 * The pending action moves through `authorizing` → `authorized` → `resumable` and is consumed by
 * the section that owns it. Any page load that does not continue this sequence (a refresh, browser
 * back, an abandoned authorization, or an OIDC error) discards it, so a mutation is never replayed.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9470.html | RFC 9470 OAuth 2.0 Step Up Authentication Challenge Protocol}
 */
import { LogtoAcr, acrSatisfies, defaultMaximumAuthenticationAgeInSeconds } from '@logto/schemas';
import { HTTPError } from 'ky';

import { accountCenterBasePath } from './account-center-internal-route';
import {
  accountStorage,
  sessionStorage,
  type PendingStepUpAction,
  type StoredPendingStepUp,
} from './session-storage';

export type { PendingStepUpAction } from './session-storage';

/** The OIDC error a step-up returns when the user can neither verify nor establish a method. */
export const unmetAuthenticationRequirementsError = 'unmet_authentication_requirements';

export type StepUpChallenge = {
  /** Space-separated ACR values, in the order the resource server prefers them. */
  acrValues: string;
  /** The maximum authentication age in seconds. */
  maxAge: string;
};

/**
 * Treat a context as stale this many seconds early: the client clock may run ahead of the server,
 * and a request still takes time to reach it, so a context that only just fits the tenant's window
 * is not safe to reuse.
 *
 * Capped at a quarter of the tenant window, so a tenant that configures the shortest window still
 * reuses the context it has just obtained instead of starting a step-up for every action.
 */
const maximumAuthenticationFreshnessMarginSeconds = 60;

/** The freshness margin for the tenant window, in seconds. Always leaves room to reuse a context. */
const getAuthenticationFreshnessMarginSeconds = (maximumAuthenticationAgeInSeconds: number) =>
  Math.max(
    1,
    Math.min(
      maximumAuthenticationFreshnessMarginSeconds,
      Math.floor(maximumAuthenticationAgeInSeconds / 4)
    )
  );

/**
 * The maximum age Account Center reuses without a step-up, for the tenant's window. Kept below the
 * Account API window for clock skew, and used as the proactive `max_age` so the provider prompts
 * exactly when Account Center considers the context stale.
 */
export const getAuthenticationFreshnessMaxAgeSeconds = (
  maximumAuthenticationAgeInSeconds: number
): number =>
  Math.max(
    0,
    maximumAuthenticationAgeInSeconds -
      getAuthenticationFreshnessMarginSeconds(maximumAuthenticationAgeInSeconds)
  );

/**
 * The Account API policy. Used when the challenge omits a parameter, which RFC 9470 allows; the
 * Account API sends both.
 */
export const getAccountApiStepUpChallenge = (
  maximumAuthenticationAgeInSeconds: number
): StepUpChallenge => ({
  acrValues: LogtoAcr.FirstFactor,
  maxAge: String(maximumAuthenticationAgeInSeconds),
});

/**
 * The proactive request. Its `max_age` matches the client freshness threshold, so a context that
 * Account Center considers stale also fails the provider's `max_age` check and triggers a prompt
 * instead of being silently reused.
 */
export const getProactiveStepUpChallenge = (
  maximumAuthenticationAgeInSeconds: number
): StepUpChallenge => ({
  acrValues: LogtoAcr.FirstFactor,
  maxAge: String(getAuthenticationFreshnessMaxAgeSeconds(maximumAuthenticationAgeInSeconds)),
});

/**
 * Whether the ID token carries a first-factor authentication context recent enough for the Account
 * API. The access token stays opaque; the ID token is the client's local source for coordinating
 * the UX before a sensitive request. The window is the tenant's authentication policy, fetched
 * from the public configuration; it falls back to the default when that configuration is
 * unavailable, and any disagreement with the server is still corrected by the challenge.
 */
export const hasFreshFirstFactorAuthentication = (
  claims: Record<string, unknown> | undefined,
  maximumAuthenticationAgeInSeconds = defaultMaximumAuthenticationAgeInSeconds,
  now = Date.now()
): boolean => {
  if (!claims || !acrSatisfies(claims.acr, LogtoAcr.FirstFactor)) {
    return false;
  }

  const { auth_time: authTime } = claims;

  if (typeof authTime !== 'number' || !Number.isFinite(authTime)) {
    return false;
  }

  // `auth_time` is whole seconds, so compare whole seconds too: a context obtained a moment ago
  // must count as fresh even at the shortest tenant window, where the threshold leaves no room for
  // a fractional age.
  const ageSeconds = Math.floor(now / 1000) - authTime;
  const marginSeconds = getAuthenticationFreshnessMarginSeconds(maximumAuthenticationAgeInSeconds);

  return (
    ageSeconds >= -marginSeconds &&
    ageSeconds <= getAuthenticationFreshnessMaxAgeSeconds(maximumAuthenticationAgeInSeconds)
  );
};

const authParameterPattern =
  /([\w!#$%&'*+.^`|~-]+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([\w!#$%&'*+.^`|~-]+))/g;

/**
 * Parse a `WWW-Authenticate` header value and return the step-up requirement when it is a Bearer
 * `insufficient_user_authentication` challenge. `fallback` fills in a missing or malformed
 * parameter, which RFC 9470 allows.
 */
export const parseStepUpChallenge = (
  header: string | undefined,
  fallback: StepUpChallenge
): StepUpChallenge | undefined => {
  const [, scheme, parameterList] = /^\s*(\S+)\s+([\S\s]*)$/.exec(header ?? '') ?? [];

  if (scheme?.toLowerCase() !== 'bearer' || !parameterList) {
    return;
  }

  const parameters = new Map<string, string>();

  for (const [, key = '', quotedValue, tokenValue = ''] of parameterList.matchAll(
    authParameterPattern
  )) {
    parameters.set(key.toLowerCase(), quotedValue?.replaceAll(/\\(.)/g, '$1') ?? tokenValue);
  }

  if (parameters.get('error') !== 'insufficient_user_authentication') {
    return;
  }

  const acrValues = parameters.get('acr_values')?.trim();
  const maxAge = parameters.get('max_age');

  return {
    acrValues: acrValues === undefined || acrValues === '' ? fallback.acrValues : acrValues,
    maxAge: maxAge && /^\d+$/.test(maxAge) ? maxAge : fallback.maxAge,
  };
};

/**
 * The step-up requirement carried by a failed Account API request, if any. The tenant policy in
 * `fallback` only fills in a parameter the challenge omitted; a parameter the server sent is
 * always authoritative.
 */
export const getStepUpChallenge = (
  error: unknown,
  fallback: StepUpChallenge
): StepUpChallenge | undefined => {
  if (!(error instanceof HTTPError) || error.response.status !== 401) {
    return;
  }

  return parseStepUpChallenge(
    error.response.headers.get('www-authenticate') ?? undefined,
    fallback
  );
};

/** Persist the action before redirecting to the authorization endpoint for a step-up. */
export const startPendingStepUp = (action: PendingStepUpAction, route: string) => {
  accountStorage.pendingStepUp.set({ action, route, phase: 'authorizing', createdAt: Date.now() });
};

/**
 * Mark the step-up authorized once the callback has exchanged its code. Only a step-up that is
 * still waiting for its callback advances, so a stale or replayed callback cannot revive an action.
 */
export const completePendingStepUp = () => {
  const record = accountStorage.pendingStepUp.get();

  if (record?.phase !== 'authorizing') {
    accountStorage.pendingStepUp.clear();
    return;
  }

  accountStorage.pendingStepUp.set({ ...record, phase: 'authorized' });
};

export const discardPendingStepUp = () => {
  accountStorage.pendingStepUp.clear();
};

/**
 * Discard a step-up that a page restored from the back-forward cache left behind, so a later
 * callback cannot resume an action the user navigated away from.
 */
export const discardPendingStepUpOnBackForwardRestore = () => {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      discardPendingStepUp();
    }
  });
};

/** The authorization endpoint answered a step-up with an OIDC error instead of a code. */
export type StepUpFailure = {
  error: string;
  /** The Account Center pathname, including the base path, the step-up started from. */
  route: string;
};

/**
 * Advance or discard the pending step-up for the page that is loading. Call once per page load,
 * before Account Center restores the stored route.
 *
 * - The authorization callback (`code`) keeps an `authorizing` step-up for the callback page.
 * - An OIDC error (`error`) discards it and returns the failure for Account Center to explain.
 * - The first load after the callback makes an `authorized` step-up `resumable`.
 * - Every other load discards it: the user refreshed, navigated back, or abandoned the step-up.
 */
export const handlePendingStepUpOnPageLoad = ({
  pathname,
  search,
}: Pick<Location, 'pathname' | 'search'>): StepUpFailure | undefined => {
  const record = accountStorage.pendingStepUp.get();

  if (!record) {
    return;
  }

  const isAccountRoot =
    pathname === accountCenterBasePath || pathname === `${accountCenterBasePath}/`;
  const parameters = new URLSearchParams(search);
  const error = isAccountRoot ? parameters.get('error') : undefined;

  if (isAccountRoot && parameters.has('code') && record.phase === 'authorizing') {
    return;
  }

  accountStorage.pendingStepUp.clear();

  if (error && record.phase === 'authorizing') {
    // The route was stored for the success path; the failure page returns to it explicitly.
    sessionStorage.clearRouteRestore();
    return {
      error,
      route: record.route.startsWith(`${accountCenterBasePath}/`)
        ? record.route
        : accountCenterBasePath,
    };
  }

  if (!error && record.phase === 'authorized') {
    accountStorage.pendingStepUp.set({ ...record, phase: 'resumable' });
  }
};

type PendingStepUpActionType = PendingStepUpAction['type'];

/**
 * Take the resumable action if it is one of `types`. The action is removed before it is returned,
 * so it runs at most once.
 */
export const consumePendingStepUpAction = <Type extends PendingStepUpActionType>(
  types: readonly Type[]
): Extract<PendingStepUpAction, { type: Type }> | undefined => {
  const record: StoredPendingStepUp | undefined = accountStorage.pendingStepUp.get();

  if (record?.phase !== 'resumable' || !isActionOfType(record.action, types)) {
    return;
  }

  accountStorage.pendingStepUp.clear();

  return record.action;
};

const isActionOfType = <Type extends PendingStepUpActionType>(
  action: PendingStepUpAction,
  types: readonly Type[]
): action is Extract<PendingStepUpAction, { type: Type }> =>
  // eslint-disable-next-line no-restricted-syntax -- widen the literal tuple to test any action type
  (types as readonly string[]).includes(action.type);
