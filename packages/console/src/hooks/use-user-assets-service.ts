import type { UserAssetsServiceStatus } from '@logto/schemas';
import useSWRImmutable from 'swr/immutable';

const useUserAssetsService = () => {
  const { data } = useSWRImmutable<UserAssetsServiceStatus>('api/user-assets/service-status');

  return {
    isReady: data?.status === 'ready',
  };
};

export default useUserAssetsService;
