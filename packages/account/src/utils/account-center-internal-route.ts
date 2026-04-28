export const accountCenterBasePath = '/account';

const getCurrentOrigin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  return window.location.origin;
};

const tryParseUrl = (url: string, base?: string) => {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
};

export const getAccountCenterInternalRoute = (
  returnUrl: string,
  currentOrigin = getCurrentOrigin()
): string | undefined => {
  if (!currentOrigin) {
    return;
  }

  const currentUrl = tryParseUrl(currentOrigin);

  if (!currentUrl) {
    return;
  }

  const parsedUrl = tryParseUrl(returnUrl, currentUrl.origin);

  if (!parsedUrl) {
    return;
  }

  const { pathname, search, hash } = parsedUrl;

  if (
    parsedUrl.origin !== currentUrl.origin ||
    (pathname !== accountCenterBasePath && !pathname.startsWith(`${accountCenterBasePath}/`))
  ) {
    return;
  }

  return `${pathname.slice(accountCenterBasePath.length) || '/'}${search}${hash}`;
};
