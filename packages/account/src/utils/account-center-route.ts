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

export const accountCenterBasePath = '/account';
const routeStorageKey = 'account-center-route-cache';
const redirectStorageKey = 'logto:account-center:redirect-url';
const showSuccessStorageKey = 'logto:account-center:show-success';
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

/**
 * Get the stored redirect URL from sessionStorage.
 */
export const getRedirectUrl = (): string | undefined => {
  if (typeof window === 'undefined') {
    return;
  }

  return sessionStorage.getItem(redirectStorageKey) ?? undefined;
};

/**
 * Store the redirect URL to sessionStorage.
 * The URL is validated to be a valid absolute URL with http/https protocol.
 */
export const setRedirectUrl = (url: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    sessionStorage.setItem(redirectStorageKey, url);
    return true;
  } catch {
    // Invalid URL
    return false;
  }
};

/**
 * Clear the stored redirect URL from sessionStorage.
 */
export const clearRedirectUrl = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(redirectStorageKey);
};

/**
 * Get the stored show success flag from sessionStorage.
 */
export const getShowSuccess = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return sessionStorage.getItem(showSuccessStorageKey) === 'true';
};

/**
 * Store the show success flag to sessionStorage.
 */
export const setShowSuccess = (value: boolean): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (value) {
    sessionStorage.setItem(showSuccessStorageKey, 'true');
  } else {
    sessionStorage.removeItem(showSuccessStorageKey);
  }
};

/**
 * Clear the stored show success flag from sessionStorage.
 */
export const clearShowSuccess = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(showSuccessStorageKey);
};

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

  if (showSuccess === '1' || showSuccess === 'true') {
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
    const storedRoute = parseStoredRoute(sessionStorage.getItem(routeStorageKey) ?? undefined);
    if (!storedRoute) {
      sessionStorage.removeItem(routeStorageKey);
      return;
    }

    const { search, hash } = window.location;
    window.history.replaceState({}, '', `${storedRoute}${search}${hash}`);
  } else if (isKnownRoute(window.location.pathname)) {
    sessionStorage.setItem(routeStorageKey, window.location.pathname);
  }
};
