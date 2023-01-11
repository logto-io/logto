/* eslint-disable unicorn/prevent-abbreviations */
import type { Optional } from '@silverhand/essentials';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { defaultPageSize } from '@/consts';

type Props = Optional<{
  pageSize?: number;
}>;

const pageIndexKey = 'page';
const keywordKey = 'keyword';

export const formatKeyword = (keyword: string) => `%${keyword}%`;

const useTableSearchParams = ({ pageSize = defaultPageSize }: Props = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchParamsState, setSearchParamsState] = useState<URLSearchParams>(searchParams);

  useEffect(() => {
    setSearchParams(searchParamsState);
  }, [searchParamsState, setSearchParams]);

  const setPageIndex = (pageIndex: number) => {
    setSearchParamsState((previousParams) => {
      const params = new URLSearchParams(previousParams);
      params.set(pageIndexKey, String(pageIndex));

      return params;
    });
  };

  const setKeyword = (value: string) => {
    setSearchParamsState((previousParams) => {
      const params = new URLSearchParams(previousParams);

      if (value) {
        params.set(keywordKey, value);
      } else {
        params.delete(keywordKey);
      }

      return params;
    });
  };

  return {
    pagination: {
      pageIndex: Number(searchParamsState.get(pageIndexKey) ?? 1),
      pageSize,
      setPageIndex,
    },
    search: {
      keyword: searchParamsState.get(keywordKey) ?? '',
      setKeyword,
    },
  };
};

export default useTableSearchParams;
/* eslint-enable unicorn/prevent-abbreviations */
