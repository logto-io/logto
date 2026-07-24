import { useContext } from 'react';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { isActionsEnabled } from '@/utils/actions';

const useIsActionsEnabled = () => {
  const {
    currentSubscriptionQuota: { inlineHooksEnabled },
  } = useContext(SubscriptionDataContext);

  return isActionsEnabled({ isCloud, isDevFeaturesEnabled, inlineHooksEnabled });
};

export default useIsActionsEnabled;
