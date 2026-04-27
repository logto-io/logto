export const accountCenterBasePath = '/account';

const getCurrentOrigin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  return window.location.origin;
};

export const getAccountCenterInternalRoute = (
  returnUrl: string,
  currentOrigin = getCurrentOrigin()
): string | undefined => {
  if (!currentOrigin) {
    return;
  }

  try {
    const { origin } = new URL(currentOrigin);
    const parsedUrl = new URL(returnUrl, origin);
    const { pathname, search, hash } = parsedUrl;

    if (
      parsedUrl.origin !== origin ||
      (pathname !== accountCenterBasePath && !pathname.startsWith(`${accountCenterBasePath}/`))
    ) {
      return;
    }

    return `${pathname.slice(accountCenterBasePath.length) || '/'}${search}${hash}`;
  } catch {}
};
