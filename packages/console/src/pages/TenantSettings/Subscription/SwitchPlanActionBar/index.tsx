import { ReservedPlanId } from '@logto/schemas';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import PlanName from '@/components/PlanName';
import { contactEmailLink } from '@/consts';
import { subscriptionPage } from '@/consts/pages';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import NotEligibleSwitchPlanModalContent from '@/pages/TenantSettings/components/NotEligibleSwitchPlanModalContent';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { isDowngradePlan, parseExceededQuotaLimitError } from '@/utils/subscription';

import DowngradeConfirmModalContent from '../DowngradeConfirmModalContent';

import * as styles from './index.module.scss';

type Props = {
  readonly currentSubscriptionPlanId: string;
  readonly subscriptionPlans: SubscriptionPlan[];
  readonly onSubscriptionUpdated: () => Promise<void>;
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
  const [currentLoadingPlanId, setCurrentLoadingPlanId] = useState<string>();

  const handleSubscribe = async (targetPlanId: string, isDowngrade: boolean) => {
    if (currentLoadingPlanId) {
      return;
    }

    const currentPlan = subscriptionPlans.find(({ id }) => id === currentSubscriptionPlanId);
    const targetPlan = subscriptionPlans.find(({ id }) => id === targetPlanId);
    if (!currentPlan || !targetPlan) {
      return;
    }

    if (isDowngrade) {
      const [result] = await show({
        ModalContent: () => (
          <DowngradeConfirmModalContent currentPlan={currentPlan} targetPlan={targetPlan} />
        ),
        title: 'subscription.downgrade_modal.title',
        confirmButtonText: 'subscription.downgrade_modal.downgrade',
        size: 'large',
      });

      if (!result) {
        return;
      }
    }

    try {
      setCurrentLoadingPlanId(targetPlanId);
      if (targetPlanId === ReservedPlanId.Free) {
        await cancelSubscription(currentTenantId);
        await onSubscriptionUpdated();
        toast.success(
          <Trans components={{ name: <PlanName name={targetPlan.name} /> }}>
            {t('downgrade_success')}
          </Trans>
        );

        return;
      }

      await subscribe({
        tenantId: currentTenantId,
        planId: targetPlanId,
        isDowngrade,
        callbackPage: subscriptionPage,
      });
    } catch (error: unknown) {
      setCurrentLoadingPlanId(undefined);
      const [result, exceededQuotaKeys] = await parseExceededQuotaLimitError(error);

      if (result) {
        await show({
          ModalContent: () => (
            <NotEligibleSwitchPlanModalContent
              targetPlan={targetPlan}
              isDowngrade={isDowngrade}
              exceededQuotaKeys={exceededQuotaKeys}
            />
          ),
          title: isDowngrade
            ? 'subscription.not_eligible_modal.downgrade_title'
            : 'subscription.not_eligible_modal.upgrade_title',
          confirmButtonText: 'general.got_it',
          confirmButtonType: 'primary',
          isCancelButtonVisible: false,
        });
        return;
      }

      void toastResponseError(error);
    } finally {
      setCurrentLoadingPlanId(undefined);
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
                  : 'subscription.upgrade'
              }
              type={isDowngrade ? 'default' : 'primary'}
              disabled={isCurrentPlan}
              isLoading={!isCurrentPlan && currentLoadingPlanId === planId}
              onClick={() => {
                void handleSubscribe(planId, isDowngrade);
              }}
            />
          </div>
        );
      })}
      <div>
        <a href={contactEmailLink} className={styles.buttonLink} rel="noopener">
          <Button title="general.contact_us_action" type="primary" />
        </a>
      </div>
    </div>
  );
}

export default SwitchPlanActionBar;
