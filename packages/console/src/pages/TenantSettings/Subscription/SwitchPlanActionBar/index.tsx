import { contactEmailLink } from '@/consts';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { isDowngradePlan } from '@/utils/subscription';

import * as styles from './index.module.scss';

type Props = {
  currentSubscriptionPlanId: string;
  subscriptionPlans: SubscriptionPlan[];
};

function SwitchPlanActionBar({ currentSubscriptionPlanId, subscriptionPlans }: Props) {
  return (
    <div className={styles.container}>
      <Spacer />
      {subscriptionPlans.map(({ id: planId }) => {
        const isCurrentPlan = currentSubscriptionPlanId === planId;
        const isDowngrade = isDowngradePlan(currentSubscriptionPlanId, planId);

        return (
          <div key={planId}>
            <Button
              title={
                isCurrentPlan
                  ? 'subscription.current'
                  : isDowngrade
                  ? 'subscription.downgrade'
                  : 'subscription.buy_now'
              }
              type={isDowngrade ? 'default' : 'primary'}
              disabled={isCurrentPlan}
              onClick={async () => {
                // Todo @xiaoyijun handle buy plan
              }}
            />
          </div>
        );
      })}
      <div>
        <a href={contactEmailLink} target="_blank" className={styles.buttonLink} rel="noopener">
          <Button title="subscription.contact_us" type="primary" />
        </a>
      </div>
    </div>
  );
}

export default SwitchPlanActionBar;
