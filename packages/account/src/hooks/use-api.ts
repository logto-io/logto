import { useLogto } from '@logto/react';
import type { Nullable } from '@silverhand/essentials';
import { useCallback, useContext } from 'react';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';

type Options = {
  silent?: boolean;
};

const useApi = <Args extends unknown[], Response>(
  api: (accessToken: string, ...args: Args) => Promise<Response>,
  options?: Options
) => {
  const { getAccessToken } = useLogto();
  const { setLoading } = useContext(LoadingContext);

  const request = useCallback(
    async (...args: Args): Promise<[Nullable<unknown>, Response?]> => {
      if (!options?.silent) {
        setLoading(true);
      }

      try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
          throw new Error('Session expired');
        }

        const result = await api(accessToken, ...args);
        return [null, result];
      } catch (error: unknown) {
        return [error];
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [api, getAccessToken, options?.silent, setLoading]
  );

  return request;
};

export default useApi;
