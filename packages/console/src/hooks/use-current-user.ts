import { useLogto } from '@logto/react';
import type { JsonObject, RequestErrorBody, UserProfileResponse } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import useAccountApi from './use-account-api';
import { RequestError } from './use-api';
import useRedirectUri from './use-redirect-uri';
import useSignOut from './use-sign-out';

const useCurrentUser = () => {
  const { isAuthenticated } = useLogto();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { signOut } = useSignOut();
  const postSignOutRedirectUri = useRedirectUri('signOut');

  const accountApi = useAccountApi();
  const accountApiFetcher = useCallback(async () => {
    try {
      return await accountApi.get('').json<UserProfileResponse>();
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { response } = error;
        const data = await response.clone().json<RequestErrorBody>();

        if (response.status === 401 && data.code === 'auth.unauthorized') {
          await signOut(postSignOutRedirectUri.href);
        } else {
          throw new RequestError(response.status, data);
        }
      }

      throw error;
    }
  }, [accountApi, postSignOutRedirectUri.href, signOut]);

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
