import { useContext } from 'react';

import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { isActionsEnabled } from '@/utils/actions';

const useIsActionsEnabled = () => {
  const {
    currentSubscriptionQuota: { actionsEnabled },
  } = useContext(SubscriptionDataContext);

  return isActionsEnabled({ isCloud, actionsEnabled });
};

export default useIsActionsEnabled;
