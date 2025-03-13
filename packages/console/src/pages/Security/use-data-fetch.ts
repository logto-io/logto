import { type CaptchaProvider } from '@logto/schemas';
import { type ResponseError } from '@withtyped/client';
import useSWR from 'swr';

import useApi from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { shouldRetryOnError } from '@/utils/request';

const useDataFetch = () => {
  const apiPath = 'api/captcha-provider';
  const fetchApi = useApi({ hideErrorToast: true });
  const fetcher = useSwrFetcher<CaptchaProvider>(fetchApi);

  const { isLoading, data, mutate, error } = useSWR<CaptchaProvider, ResponseError>(apiPath, {
    fetcher,
    shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
  });

  return {
    isLoading: isLoading && !error,
    data,
    mutate,
    error,
  };
};

export default useDataFetch;
