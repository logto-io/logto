import { condString } from '@silverhand/essentials';
import { useContext } from 'react';

import { defaultTenantResponse } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';

import useSubscription from '../../hooks/use-subscription';

import { type Context } from './types';

const useSubscriptionData: () => Context & { isLoading: boolean } = () => {
  const { currentTenant } = useContext(TenantsContext);
  const {
    data: currentSubscription,
    isLoading: isSubscriptionLoading,
    mutate: mutateSubscription,
  } = useSubscription(condString(currentTenant?.id));

  return {
    isLoading: isSubscriptionLoading,
    currentSubscription: currentSubscription ?? defaultTenantResponse.subscription,
    onCurrentSubscriptionUpdated: mutateSubscription,
  };
};

export default useSubscriptionData;
