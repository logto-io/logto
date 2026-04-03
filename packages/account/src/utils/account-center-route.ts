import { yes } from '@silverhand/essentials';

import {
  emailRoute,
  emailSuccessRoute,
  phoneRoute,
  phoneSuccessRoute,
  passwordRoute,
  passwordSuccessRoute,
  usernameRoute,
  usernameSuccessRoute,
  authenticatorAppRoute,
  authenticatorAppSuccessRoute,
  backupCodesGenerateRoute,
  backupCodesRegenerateRoute,
  backupCodesManageRoute,
  backupCodesSuccessRoute,
  passkeyAddRoute,
  passkeyManageRoute,
  passkeySuccessRoute,
  verifiedActionRoute,
  socialRoutePrefix,
} from '@ac/constants/routes';

import { sessionStorage } from './session-storage';

export const accountCenterBasePath = '/account';
const redirectUrlParameter = 'redirect';
const showSuccessParameter = 'show_success';
const uiLocalesParameter = 'ui_locales';
const identifierParameter = 'identifier';

const knownRoutePrefixes: readonly string[] = [
  emailRoute,
  emailSuccessRoute,
  phoneRoute,
  phoneSuccessRoute,
  passwordRoute,
  passwordSuccessRoute,
  usernameRoute,
  usernameSuccessRoute,
  authenticatorAppRoute,
  authenticatorAppSuccessRoute,
  backupCodesGenerateRoute,
  backupCodesRegenerateRoute,
  backupCodesManageRoute,
  backupCodesSuccessRoute,
  passkeyAddRoute,
  passkeyManageRoute,
  passkeySuccessRoute,
  verifiedActionRoute,
  socialRoutePrefix,
];

const isKnownRoute = (pathname?: string): pathname is string =>
  pathname !== undefined &&
  knownRoutePrefixes.some((prefix) =>
    pathname.replace(accountCenterBasePath, '').startsWith(prefix)
  );

const parseStoredRoute = (storedRoute: string | undefined): string | undefined => {
  if (storedRoute && isKnownRoute(storedRoute)) {
    return storedRoute;
  }
  return undefined;
};

const shouldSkipHandling = (search: string) => {
  const parameters = new URLSearchParams(search);
  return parameters.has('code') || parameters.has('error');
};

export const {
  getShowSuccess,
  setShowSuccess,
  clearShowSuccess,
  getUiLocales,
  setUiLocales,
  clearUiLocales,
  getIdentifier,
  setIdentifier,
  clearIdentifier,
} = sessionStorage;

/**
 * Parse and store the redirect URL and show success flag from query parameters.
 * This needs to be done before OAuth flow starts so it persists through the sign-in.
 */
const handleRedirectParameter = () => {
  const parameters = new URLSearchParams(window.location.search);
  const redirectUrl = parameters.get(redirectUrlParameter);
  const showSuccess = parameters.get(showSuccessParameter);

  if (redirectUrl) {
    try {
      const parsed = new URL(redirectUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        sessionStorage.setPendingReturn(redirectUrl);
      }
    } catch {
      // Invalid URL — silently ignore
    }
  }

  if (yes(showSuccess)) {
    setShowSuccess(true);
  }

  const identifier = parameters.get(identifierParameter);
  if (identifier) {
    setIdentifier(identifier);
  }
};

const handleUiLocalesParameter = () => {
  const parameters = new URLSearchParams(window.location.search);
  const uiLocales = parameters.get(uiLocalesParameter);

  if (uiLocales) {
    setUiLocales(uiLocales);
    return;
  }

  clearUiLocales();
};

/**
 * Handle Account Center route restoration for sign in redirect.
 */
export const handleAccountCenterRoute = () => {
  // Parse and store redirect URL first (before any OAuth redirects)
  handleRedirectParameter();

  if (shouldSkipHandling(window.location.search)) {
    return;
  }

  handleUiLocalesParameter();

  // Restore the stored route if the current path is the base path.
  if (window.location.pathname === accountCenterBasePath) {
    const storedRoute = parseStoredRoute(sessionStorage.getRouteRestore());
    // Always clear the stored route to ensure one-time restoration
    sessionStorage.clearRouteRestore();

    if (!storedRoute) {
      return;
    }

    const { search, hash } = window.location;
    window.history.replaceState({}, '', `${storedRoute}${search}${hash}`);
  }
};

export const { getPendingReturn, setPendingReturn, clearPendingReturn } = sessionStorage;
export const setRouteRestore = (pathname: string) => {
  if (isKnownRoute(pathname)) {
    sessionStorage.setRouteRestore(pathname);
  }
};
