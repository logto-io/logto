import type { User } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import useSWR from 'swr';

import { adminTenantEndpoint, meApi } from '@/consts';

import type { RequestError } from './use-api';
import { useStaticApi } from './use-api';
import useLogtoUserId from './use-logto-user-id';
import useSwrFetcher from './use-swr-fetcher';

const useLogtoAdminUser = (): [Optional<User>, () => void, boolean] => {
  const userId = useLogtoUserId();
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });
  const fetcher = useSwrFetcher<User>(api);
  const {
    data: user,
    error,
    mutate,
  } = useSWR<User, RequestError>(userId && `me/users/${userId}`, fetcher);

  const isLoading = !user && !error;

  return [user, mutate, isLoading];
};

export default useLogtoAdminUser;
