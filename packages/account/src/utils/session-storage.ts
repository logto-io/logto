const storagePrefix = 'logto:account-center:';

const storageKeys = Object.freeze({
  redirectUrl: `${storagePrefix}redirect-url`,
  showSuccess: `${storagePrefix}show-success`,
  identifier: `${storagePrefix}identifier`,
});

export const sessionStorage = Object.freeze({
  getRedirectUrl: (): string | undefined => {
    if (typeof window === 'undefined') {
      return;
    }
    return window.sessionStorage.getItem(storageKeys.redirectUrl) ?? undefined;
  },

  setRedirectUrl: (url: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false;
      }
      window.sessionStorage.setItem(storageKeys.redirectUrl, url);
      return true;
    } catch {
      // Invalid URL
      return false;
    }
  },

  clearRedirectUrl: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.removeItem(storageKeys.redirectUrl);
  },

  getShowSuccess: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.sessionStorage.getItem(storageKeys.showSuccess) === 'true';
  },

  setShowSuccess: (value: boolean): void => {
    if (typeof window === 'undefined') {
      return;
    }

    if (value) {
      window.sessionStorage.setItem(storageKeys.showSuccess, 'true');
    } else {
      window.sessionStorage.removeItem(storageKeys.showSuccess);
    }
  },

  clearShowSuccess: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.removeItem(storageKeys.showSuccess);
  },

  getIdentifier: (): string | undefined => {
    if (typeof window === 'undefined') {
      return;
    }
    return window.sessionStorage.getItem(storageKeys.identifier) ?? undefined;
  },

  setIdentifier: (value: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.setItem(storageKeys.identifier, value);
  },

  clearIdentifier: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.removeItem(storageKeys.identifier);
  },
});
