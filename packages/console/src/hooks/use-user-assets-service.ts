import { type UserAssetsServiceStatus } from '@logto/schemas';
import { useLocation } from 'react-router-dom';
import useSWRImmutable from 'swr/immutable';

import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud } from '@/consts/env';
import { GlobalRoute } from '@/contexts/TenantsProvider';

import useApi, { useStaticApi, type RequestError } from './use-api';
import useSwrFetcher from './use-swr-fetcher';

/**
 * Hook to check if the user assets service (file uploading) is ready.
 *
 * Caveats: When using it in a form, remember to check `isLoading` first and don't render the form
 * until it's settled. Otherwise, the form may be rendered with unexpected behavior, such as
 * registering a unexpected validate function. If you really need to render the form while loading,
 * you can use the `shouldUnregister` option from `react-hook-form` to unregister the field when
 * the component is unmounted.
 */
const useUserAssetsService = () => {
  const adminApi = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
  });
  const api = useApi();
  const { pathname } = useLocation();
  const isProfilePage =
    pathname === GlobalRoute.Profile || pathname.startsWith(GlobalRoute.Profile + '/');
  const shouldUseAdminApi = isCloud && isProfilePage;

  const fetcher = useSwrFetcher<UserAssetsServiceStatus>(shouldUseAdminApi ? adminApi : api);
  const { data, error } = useSWRImmutable<UserAssetsServiceStatus, RequestError>(
    `${shouldUseAdminApi ? 'me' : 'api'}/user-assets/service-status`,
    fetcher
  );

  return {
    /**
     * Whether the user assets service (file uploading) is ready.
     * @see {@link useUserAssetsService} for caveats.
     */
    isReady: data?.status === 'ready',
    isLoading: !error && !data,
  };
};

export default useUserAssetsService;
