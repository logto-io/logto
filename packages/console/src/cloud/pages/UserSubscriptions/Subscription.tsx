import { useOutletContext } from 'react-router-dom';

import EnterpriseSubscription from '../EnterpriseSubscription/Subscription';

import PersonalSubscriptions from './PersonalSubscriptions';
import { type UserSubscriptionsOutletContext } from './types';

function Subscription() {
  const { enterprise } = useOutletContext<UserSubscriptionsOutletContext>();
  return (
    <>
      {enterprise && <EnterpriseSubscription logtoEnterpriseId={enterprise.id} />}
      <PersonalSubscriptions />
    </>
  );
}

export default Subscription;
