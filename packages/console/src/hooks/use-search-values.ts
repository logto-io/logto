import { useMemo } from 'react';
import useSWR from 'swr';

import { defaultPageSize } from '@/consts';
import { buildUrl } from '@/utils/url';

import { type RequestError } from './use-api';

const useSearchValues = <T>(pathname: string, keyword: string) => {
  const {
    data: response,
    error,
    mutate,
  } = useSWR<[T[], number], RequestError>(
    buildUrl(pathname, {
      page: String(1),
      page_size: String(defaultPageSize),
      q: keyword,
    }),
    { revalidateOnFocus: false }
  );
  const [data] = response ?? [[], 0];

  return useMemo(
    () => ({
      isLoading: !response && !error,
      data,
      mutate,
      error,
    }),
    [data, error, mutate, response]
  );
};

export default useSearchValues;
