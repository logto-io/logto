import { useMemo } from 'react';
import useSWR from 'swr';

import { defaultPageSize } from '@/consts';
import { buildUrl } from '@/utils/url';

import { type RequestError } from './use-api';

const useSearchValues = <T>(pathname: string, keyword: string) => {
  const {
    data: response,
    error, // TODO: handle error
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
      data,
      mutate,
      error,
    }),
    [data, error, mutate]
  );
};

export default useSearchValues;
