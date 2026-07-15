import { type InlineHook, type LogtoInlineHookKey } from '@logto/schemas';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { shouldRetryOnError } from '@/utils/request';

import { InlineHookAction } from '../types';
import { getInlineHookApiPath } from '../utils';

const useDataFetch = (hookType: LogtoInlineHookKey, action: InlineHookAction) => {
  const apiPath = getInlineHookApiPath(hookType);
  const fetchApi = useApi({ hideErrorToast: true });
  const fetcher = useSwrFetcher<InlineHook>(fetchApi);

  const { isLoading, data, mutate, error } = useSWR<InlineHook, RequestError>(
    action === InlineHookAction.Create ? undefined : apiPath,
    {
      fetcher,
      shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
    }
  );

  return {
    isLoading: isLoading && !error,
    data,
    mutate,
    error,
  };
};

export default useDataFetch;
