import type { UserProfileResponse } from '@logto/schemas';
import useSWR from 'swr';

import { adminTenantEndpoint, meApi } from '@/consts';

import type { RequestError } from './use-api';
import { useStaticApi } from './use-api';
import useLogtoUserId from './use-logto-user-id';
import useSwrFetcher from './use-swr-fetcher';

const useCurrentUser = () => {
  const userId = useLogtoUserId();
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const fetcher = useSwrFetcher<UserProfileResponse>(api);
  const {
    data: user,
    error,
    mutate,
  } = useSWR<UserProfileResponse, RequestError>(userId && 'me', fetcher);

  const isLoading = !user && !error;

  return { user, isLoading, error, reload: mutate };
};

export default useCurrentUser;
