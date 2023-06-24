import { useLogto } from '@logto/react';
import { isKeyInObject } from '@logto/shared/universal';
import { conditional } from '@silverhand/essentials';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { adminTenantEndpoint, meApi } from '@/consts';

import type { RequestError } from './use-api';
import { useStaticApi } from './use-api';
import useLogtoUserId from './use-logto-user-id';
import useSwrFetcher from './use-swr-fetcher';

const useMeCustomData = () => {
  const { isAuthenticated, error: authError } = useLogto();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const userId = useLogtoUserId();
  const shouldFetch = isAuthenticated && !authError && userId;
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  const fetcher = useSwrFetcher(api);

  const {
    data: meData,
    mutate,
    error,
    // Reuse the same key `me` as `useCurrentUser()` to avoid additional requests.
  } = useSWR<unknown, RequestError>(shouldFetch && 'me', fetcher);
  const data = conditional(isKeyInObject(meData, 'customData') && meData.customData);

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
    [api, mutate, t, userId]
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
