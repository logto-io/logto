import { contactEmailLink } from '@/consts';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { isDowngradePlan } from '@/utils/subscription';

import DowngradeConfirmModalContent from '../DowngradeConfirmModalContent';

import * as styles from './index.module.scss';

type Props = {
  currentSubscriptionPlanId: string;
  subscriptionPlans: SubscriptionPlan[];
};

function SwitchPlanActionBar({ currentSubscriptionPlanId, subscriptionPlans }: Props) {
  const { show } = useConfirmModal();

  const handleDowngrade = async (targetPlanId: string) => {
    const currentPlan = subscriptionPlans.find(({ id }) => id === currentSubscriptionPlanId);
    const targetPlan = subscriptionPlans.find(({ id }) => id === targetPlanId);
    if (!currentPlan || !targetPlan) {
      return;
    }

    const [result] = await show({
      ModalContent: () => (
        <DowngradeConfirmModalContent currentPlan={currentPlan} targetPlan={targetPlan} />
      ),
      title: 'subscription.downgrade_modal.title',
      confirmButtonText: 'subscription.downgrade_modal.downgrade',
      size: 'large',
    });

    if (result) {
      // Todo @xiaoyijun handle downgrade
    }
  };

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
                if (isDowngrade) {
                  await handleDowngrade(planId);
                  // eslint-disable-next-line no-useless-return
                  return;
                }
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
