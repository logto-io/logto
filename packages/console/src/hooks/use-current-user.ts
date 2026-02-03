import { useLogto } from '@logto/react';
import type { JsonObject, UserProfileResponse } from '@logto/schemas';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import useAccountApi from './use-account-api';
import type { RequestError } from './use-api';

const useCurrentUser = () => {
  const { isAuthenticated } = useLogto();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const accountApi = useAccountApi();
  const accountApiFetcher = useCallback(
    async () => accountApi.get('').json<UserProfileResponse>(),
    [accountApi]
  );

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<UserProfileResponse, RequestError>(isAuthenticated && 'me', accountApiFetcher);

  const updateCustomData = useCallback(
    async (customData: JsonObject) => {
      if (!user) {
        toast.error(t('errors.unexpected_error'));
        return;
      }

      // Account API uses 'replace' mode, so we need to merge with existing customData
      const mergedCustomData = { ...user.customData, ...customData };
      const data = await accountApi
        .patch('', { json: { customData: mergedCustomData } })
        .json<UserProfileResponse>();
      await mutate({ ...user, customData: data.customData });
    },
    [accountApi, mutate, t, user]
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
