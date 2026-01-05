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
} from '@ac/constants/routes';

import { sessionStorage } from './session-storage';

export const accountCenterBasePath = '/account';
const routeStorageKey = 'account-center-route-cache';
const redirectUrlParameter = 'redirect';
const showSuccessParameter = 'show_success';

const knownRoutePrefixes: readonly string[] = [
  emailRoute,
  emailSuccessRoute,
  phoneRoute,
  phoneSuccessRoute,
  passwordRoute,
  passwordSuccessRoute,
  usernameRoute,
  usernameSuccessRoute,
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
  getRedirectUrl,
  setRedirectUrl,
  clearRedirectUrl,
  getShowSuccess,
  setShowSuccess,
  clearShowSuccess,
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
    setRedirectUrl(redirectUrl);
  }

  if (yes(showSuccess)) {
    setShowSuccess(true);
  }
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

  // Restore the stored route if the current path is the base path.
  if (window.location.pathname === accountCenterBasePath) {
    const storedRoute = parseStoredRoute(
      window.sessionStorage.getItem(routeStorageKey) ?? undefined
    );
    // Always clear the stored route to ensure one-time restoration
    window.sessionStorage.removeItem(routeStorageKey);

    if (!storedRoute) {
      return;
    }

    const { search, hash } = window.location;
    window.history.replaceState({}, '', `${storedRoute}${search}${hash}`);
  } else if (isKnownRoute(window.location.pathname)) {
    window.sessionStorage.setItem(routeStorageKey, window.location.pathname);
  }
};
