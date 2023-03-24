import { HTTPError, type Options } from 'ky';
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
    async (resource: string | URL, init: Options) => {
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
          // See https://stackoverflow.com/questions/53511974/javascript-fetch-failed-to-execute-json-on-response-body-stream-is-locked
          // for why `.clone()` is needed
          throw new RequestError(response.status, await response.clone().json());
        }
        throw error;
      }
    },
    [api, t]
  );

  return fetcher;
};

export default useSwrFetcher;
