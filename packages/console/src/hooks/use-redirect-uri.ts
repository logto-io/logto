import { ossConsolePath } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import { useHref } from 'react-router-dom';

import { isCloud } from '@/consts/env';

/**
 * The hook that returns the absolute URL for the sign-in or sign-out callback.
 * The path is not related to react-router, which means the path will also include
 * the basename of react-router if it's set.
 */
const useRedirectUri = (flow: 'signIn' | 'signOut' = 'signIn') => {
  const path = useHref(
    flow === 'signOut' ? '/' : conditionalArray(!isCloud && ossConsolePath, '/callback').join('/')
  );

  return new URL(path, window.location.origin);
};

export default useRedirectUri;
