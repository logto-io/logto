import type { UserAssetsServiceStatus } from '@logto/schemas';
import useSWRImmutable from 'swr/immutable';

import type { RequestError } from './use-api';

const useUserAssetsService = () => {
  const { data, error } = useSWRImmutable<UserAssetsServiceStatus, RequestError>(
    'api/user-assets/service-status'
  );

  return {
    isReady: data?.status === 'ready',
    isLoading: !error && !data,
  };
};

export default useUserAssetsService;
