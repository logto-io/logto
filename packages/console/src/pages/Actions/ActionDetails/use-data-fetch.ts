import { type LogtoAction, type LogtoActionKey } from '@logto/schemas';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { shouldRetryOnError } from '@/utils/request';

import { ActionPageMode } from '../types';
import { getActionApiPath } from '../utils';

const useDataFetch = (actionType: LogtoActionKey, mode: ActionPageMode) => {
  const apiPath = getActionApiPath(actionType);
  const fetchApi = useApi({ hideErrorToast: true });
  const fetcher = useSwrFetcher<LogtoAction>(fetchApi);

  const { isLoading, data, mutate, error } = useSWR<LogtoAction, RequestError>(
    mode === ActionPageMode.Create ? undefined : apiPath,
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
