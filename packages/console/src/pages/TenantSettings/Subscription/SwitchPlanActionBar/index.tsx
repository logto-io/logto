import { useContext } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import PlanName from '@/components/PlanName';
import { contactEmailLink } from '@/consts';
import { subscriptionPage } from '@/consts/pages';
import { ReservedPlanId } from '@/consts/subscriptions';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { isDowngradePlan } from '@/utils/subscription';

import DowngradeConfirmModalContent from '../DowngradeConfirmModalContent';
import NotEligibleDowngradeModalContent from '../NotEligibleDowngradeModalContent';

import * as styles from './index.module.scss';

type Props = {
  currentSubscriptionPlanId: string;
  subscriptionPlans: SubscriptionPlan[];
  onSubscriptionUpdated: () => void;
};

function SwitchPlanActionBar({
  currentSubscriptionPlanId,
  subscriptionPlans,
  onSubscriptionUpdated,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const { currentTenantId } = useContext(TenantsContext);
  const { subscribe, cancelSubscription } = useSubscribe();
  const { show } = useConfirmModal();

  const handleDownGrade = async (targetPlan: SubscriptionPlan) => {
    const { id: planId, name } = targetPlan;
    try {
      if (planId === ReservedPlanId.free) {
        await cancelSubscription(currentTenantId);
        onSubscriptionUpdated();
        toast.success(
          <Trans components={{ name: <PlanName name={name} /> }}>{t('downgrade_success')}</Trans>
        );
        return;
      }

      await subscribe({
        tenantId: currentTenantId,
        planId,
        isDowngrade: true,
        callbackPage: subscriptionPage,
      });
    } catch (error: unknown) {
      // Todo @xiaoyijun check if the error is not eligible downgrade error or not
      await show({
        ModalContent: () => <NotEligibleDowngradeModalContent targetPlan={targetPlan} />,
        title: 'subscription.downgrade_modal.not_eligible',
        confirmButtonText: 'general.got_it',
        confirmButtonType: 'primary',
      });

      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const onDowngradeClick = async (targetPlanId: string) => {
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
      await handleDownGrade(targetPlan);
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
              onClick={() => {
                if (isDowngrade) {
                  void onDowngradeClick(planId);

                  return;
                }
                void subscribe({
                  tenantId: currentTenantId,
                  planId,
                  callbackPage: subscriptionPage,
                });
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
