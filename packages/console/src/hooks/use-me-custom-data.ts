import { useLogto } from '@logto/react';
import { t } from 'i18next';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

import { adminTenantEndpoint, meApi } from '@/consts';

import type { RequestError } from './use-api';
import { useStaticApi } from './use-api';
import useLogtoUserId from './use-logto-user-id';
import useSwrFetcher from './use-swr-fetcher';

const useMeCustomData = () => {
  const { isAuthenticated, error: authError } = useLogto();
  const userId = useLogtoUserId();
  const shouldFetch = isAuthenticated && !authError && userId;
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  const fetcher = useSwrFetcher(api);

  const { data, mutate, error } = useSWR<unknown, RequestError>(
    shouldFetch && `me/custom-data`,
    fetcher
  );

  const update = useCallback(
    async (data: Record<string, unknown>) => {
      if (!userId) {
        toast.error(t('errors.unexpected_error'));

        return;
      }
      const updated = await api
        .patch(`me/custom-data`, {
          json: data,
        })
        .json();
      await mutate(updated);
    },
    [api, mutate, userId]
  );

  return {
    data,
    error,
    isLoading: !data && !error,
    isLoaded: Boolean(data && !error),
    update,
  };
};

export default useMeCustomData;
