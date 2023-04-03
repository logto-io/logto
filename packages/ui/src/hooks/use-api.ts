import type { Nullable } from '@silverhand/essentials';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

const useApi = <Args extends unknown[], Response>(api: (...args: Args) => Promise<Response>) => {
  const { setLoading } = useContext(PageContext);

  const request = useCallback(
    async (...args: Args): Promise<[Nullable<unknown>, Response?]> => {
      setLoading(true);

      try {
        const result = await api(...args);

        return [null, result];
      } catch (error: unknown) {
        return [error];
      } finally {
        setLoading(false);
      }
    },
    [api, setLoading]
  );

  return request;
};

export default useApi;
