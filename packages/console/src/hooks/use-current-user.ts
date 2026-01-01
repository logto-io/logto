import { useLogto } from '@logto/react';
import type { JsonObject, UserProfileResponse } from '@logto/schemas';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { adminTenantEndpoint, meApi } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';

import useAccountApi from './use-account-api';
import type { RequestError } from './use-api';
import { useStaticApi } from './use-api';
import useSwrFetcher from './use-swr-fetcher';

const useCurrentUser = () => {
  const { isAuthenticated } = useLogto();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const meApi_ = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
  });
  const accountApi = useAccountApi();
  const api = isDevFeaturesEnabled ? accountApi : meApi_;
  const fetcher = useSwrFetcher<UserProfileResponse>(api);
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<UserProfileResponse, RequestError>(
    isAuthenticated && (isDevFeaturesEnabled ? 'api/my-account' : 'me'),
    fetcher
  );

  const updateCustomData = useCallback(
    async (customData: JsonObject) => {
      if (!user) {
        toast.error(t('errors.unexpected_error'));
        return;
      }

      await (isDevFeaturesEnabled
        ? mutate({
            ...user,
            customData: await accountApi
              .patch('api/my-account', {
                json: { customData },
              })
              .json<UserProfileResponse>()
              .then((response) => response.customData),
          })
        : mutate({
            ...user,
            customData: await meApi_
              .patch('me/custom-data', {
                json: customData,
              })
              .json<JsonObject>(),
          }));
    },
    [accountApi, meApi_, mutate, t, user]
  );

  return {
    user,
    isLoading,
    error,
    isLoaded: !isLoading && !error,
    reload: mutate,
    customData: user?.customData,
    /** Patch (shallow merge) the custom data of the current user. */
    updateCustomData,
  };
};

export default useCurrentUser;
