import type { RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import type { KyInstance } from 'ky/distribution/types/ky';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { BareFetcher } from 'swr';

import { RequestError } from './use-api';

type WithTotalNumber<T> = Array<Awaited<T> | number>;

type useSwrFetcherHook = {
  <T>(api: KyInstance): BareFetcher<T>;
  <T extends unknown[]>(api: KyInstance): BareFetcher<WithTotalNumber<T>>;
};

const useSwrFetcher: useSwrFetcherHook = <T>(api: KyInstance) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const fetcher = useCallback<BareFetcher<T | WithTotalNumber<T>>>(
    async (resource, init) => {
      try {
        const response = await api.get(resource, init);
        const data = await response.json<T>();

        if (typeof resource === 'string' && resource.includes('?')) {
          const parameters = new URLSearchParams(resource.split('?')[1]);

          if (parameters.get('page') && parameters.get('page_size')) {
            const number = response.headers.get('Total-Number');

            if (!number) {
              throw new Error(t('errors.missing_total_number'));
            }

            return [data, Number(number)];
          }
        }

        return data;
      } catch (error: unknown) {
        if (error instanceof HTTPError) {
          const { response } = error;
          const metadata = await response.json<RequestErrorBody>();
          throw new RequestError(response.status, metadata);
        }
        throw error;
      }
    },
    [api, t]
  );

  return fetcher;
};

export default useSwrFetcher;
