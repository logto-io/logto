import { trySafe } from '@silverhand/essentials';
import { type Path } from 'react-router-dom';
import { z } from 'zod';

import { storageKeys } from '@/consts';

/** Save the current url to session storage so that we can redirect to it after sign in. */
export const saveRedirect = (target?: URL) => {
  const isValidTarget = target && target.origin === window.location.origin;
  const { pathname, search, hash } = isValidTarget ? target : window.location;
  sessionStorage.setItem(
    storageKeys.redirectAfterSignIn,
    JSON.stringify({ pathname, search, hash })
  );
};

const partialPathGuard = z
  .object({
    pathname: z.string(),
    search: z.string(),
    hash: z.string(),
  })
  .partial() satisfies z.ZodType<Partial<Path>>;

/** Get the saved redirect url from session storage and remove it. */
export const consumeSavedRedirect = () => {
  const saved = trySafe(() =>
    partialPathGuard.parse(
      JSON.parse(sessionStorage.getItem(storageKeys.redirectAfterSignIn) ?? '')
    )
  );

  if (saved) {
    sessionStorage.removeItem(storageKeys.redirectAfterSignIn);
  }
  return saved;
};
