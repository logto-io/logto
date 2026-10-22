import { useOutletContext } from 'react-router-dom';

import FormCard from '@/components/FormCard';

import EnterpriseCoverage from './EnterpriseCoverage';
import PersonalSubscriptions from './PersonalSubscriptions';
import { type UserSubscriptionsOutletContext } from './types';

function Subscription() {
  const { enterprise } = useOutletContext<UserSubscriptionsOutletContext>();
  return (
    <>
      {enterprise && (
        <FormCard
          title="enterprise_subscription.subscription.enterprise_plan_title"
          description="enterprise_subscription.user_subscriptions.enterprise_description"
        >
          <EnterpriseCoverage enterprise={enterprise} />
        </FormCard>
      )}
      <PersonalSubscriptions />
    </>
  );
}

export default Subscription;
