import { conditional } from '@silverhand/essentials';
import { useCallback } from 'react';
import {
  type NavigateFunction,
  type NavigateOptions,
  type To,
  useNavigate,
} from 'react-router-dom';

import { searchKeys } from '@/utils/search-parameters';

/**
 * This hook wraps the `useNavigate` hook from `react-router-dom` and preserves `app_id`
 * search parameters across page navigation.
 * The `app_id` is essential for maintaining oidc interaction sessions, since we are now
 * using the "client-specific interaction cookie", by storing the `app_id:interaction_id`
 * mapping in the `_interaction` cookie.
 *
 * @returns A navigate function that preserves `app_id` search parameters.
 */
const useNavigateWithPreservedSearchParams = () => {
  const navigate = useNavigate();

  const navigateWithSearchParams: NavigateFunction = useCallback(
    (firstArg: To | number, options?: NavigateOptions) => {
      if (typeof firstArg === 'number') {
        navigate(firstArg);
        return;
      }

      const appId = sessionStorage.getItem(searchKeys.appId);

      if (typeof firstArg === 'string') {
        const searchParams = new URLSearchParams();
        if (appId) {
          searchParams.set(searchKeys.appId, appId);
        }
        navigate(
          {
            pathname: firstArg,
            ...conditional(searchParams.size > 0 && { search: searchParams.toString() }),
          },
          options
        );
        return;
      }

      const { pathname, search, ...rest } = firstArg;
      const searchParams = new URLSearchParams(search);
      if (appId) {
        searchParams.set(searchKeys.appId, appId);
      }
      navigate(
        {
          pathname,
          ...conditional(searchParams.size > 0 && { search: searchParams.toString() }),
          ...rest,
        },
        options
      );
    },
    [navigate]
  );

  return navigateWithSearchParams;
};

export default useNavigateWithPreservedSearchParams;
