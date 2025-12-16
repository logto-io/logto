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
const storageKey = 'account-center-route-cache';

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
 * Handle Account Center route restoration for sign in redirect.
 */
export const handleAccountCenterRoute = () => {
  if (shouldSkipHandling(window.location.search)) {
    return;
  }

  // Restore the stored route if the current path is the base path.
  if (window.location.pathname === accountCenterBasePath) {
    const storedRoute = parseStoredRoute(sessionStorage.getItem(storageKey) ?? undefined);
    if (!storedRoute) {
      sessionStorage.removeItem(storageKey);
      return;
    }

    const { search, hash } = window.location;
    window.history.replaceState({}, '', `${storedRoute}${search}${hash}`);
  } else if (isKnownRoute(window.location.pathname)) {
    sessionStorage.setItem(storageKey, window.location.pathname);
  }
};
