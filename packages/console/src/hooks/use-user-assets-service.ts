import { type UserAssetsServiceStatus } from '@logto/schemas';
import { useLocation } from 'react-router-dom';
import useSWRImmutable from 'swr/immutable';

import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud } from '@/consts/env';
import { GlobalAnonymousRoute } from '@/contexts/TenantsProvider';

import useApi, { useStaticApi, type RequestError } from './use-api';
import useSwrFetcher from './use-swr-fetcher';

const useUserAssetsService = () => {
  const adminApi = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
  });
  const api = useApi();
  const { pathname } = useLocation();
  const isProfilePage =
    pathname === GlobalAnonymousRoute.Profile ||
    pathname.startsWith(GlobalAnonymousRoute.Profile + '/');
  const shouldUseAdminApi = isCloud && isProfilePage;

  const fetcher = useSwrFetcher<UserAssetsServiceStatus>(shouldUseAdminApi ? adminApi : api);
  const { data, error } = useSWRImmutable<UserAssetsServiceStatus, RequestError>(
    `${shouldUseAdminApi ? 'me' : 'api'}/user-assets/service-status`,
    fetcher
  );

  return {
    isReady: data?.status === 'ready',
    isLoading: !error && !data,
  };
};

export default useUserAssetsService;
