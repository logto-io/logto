import { useLogto } from '@logto/react';
import type { JsonObject, UserProfileResponse } from '@logto/schemas';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';

import type { RequestError } from './use-api';
import { useStaticApi } from './use-api';
import useSwrFetcher from './use-swr-fetcher';

/**
 * Account API URL:
 * - In Cloud, use `/a/` proxy path to avoid cross-origin issues
 * - In OSS, directly use admin tenant endpoint
 */
const accountApiUrl = isCloud
  ? new URL('/a/', window.location.origin).toString()
  : new URL('api/my-account/', adminTenantEndpoint).toString();

const useCurrentUser = () => {
  const { isAuthenticated, getAccessToken } = useLogto();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const meApiFetcher = useSwrFetcher<UserProfileResponse>(api);

  const accountApiFetcher = useCallback(async (): Promise<UserProfileResponse> => {
    const accessToken = await getAccessToken();
    const response = await fetch(accountApiUrl, {
      headers: { Authorization: `Bearer ${accessToken ?? ''}` },
    });
    return response.json<UserProfileResponse>();
  }, [getAccessToken]);

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<UserProfileResponse, RequestError>(
    isAuthenticated && 'me',
    isDevFeaturesEnabled ? accountApiFetcher : meApiFetcher
  );

  const updateCustomData = useCallback(
    async (customData: JsonObject) => {
      if (!user) {
        toast.error(t('errors.unexpected_error'));
        return;
      }

      if (isDevFeaturesEnabled) {
        const accessToken = await getAccessToken();
        const response = await fetch(accountApiUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken ?? ''}`,
          },
          body: JSON.stringify({ customData }),
        });

        if (!response.ok) {
          toast.error(t('errors.unknown_server_error'));
          return;
        }

        const data: UserProfileResponse = await response.json();
        await mutate({ ...user, customData: data.customData });
      } else {
        await mutate({
          ...user,
          customData: await api.patch('me/custom-data', { json: customData }).json<JsonObject>(),
        });
      }
    },
    [api, getAccessToken, mutate, t, user]
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
