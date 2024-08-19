import { ReservedPlanId } from '@logto/schemas';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type LogtoSkuResponse } from '@/cloud/types/router';
import PlanName from '@/components/PlanName';
import { contactEmailLink } from '@/consts';
import { subscriptionPage } from '@/consts/pages';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import { NotEligibleSwitchSkuModalContent } from '@/pages/TenantSettings/components/NotEligibleSwitchPlanModalContent';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { isDowngradePlan, parseExceededSkuQuotaLimitError } from '@/utils/subscription';

import DowngradeConfirmModalContent from '../DowngradeConfirmModalContent';

import styles from './index.module.scss';

type Props = {
  readonly currentSubscriptionPlanId: string;
  readonly subscriptionPlans: SubscriptionPlan[];
  readonly currentSkuId: string;
  readonly logtoSkus: LogtoSkuResponse[];
  readonly onSubscriptionUpdated: () => Promise<void>;
};

function SwitchPlanActionBar({
  currentSubscriptionPlanId,
  subscriptionPlans,
  onSubscriptionUpdated,
  currentSkuId,
  logtoSkus,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const { currentTenantId } = useContext(TenantsContext);
  const { subscribe, cancelSubscription } = useSubscribe();
  const { show } = useConfirmModal();
  const [currentLoadingPlanId, setCurrentLoadingPlanId] = useState<string>();

  const handleSubscribe = async (targetSkuId: string, isDowngrade: boolean) => {
    if (currentLoadingPlanId) {
      return;
    }

    // TODO: clear plan related use cases.
    const currentPlan = subscriptionPlans.find(({ id }) => id === currentSubscriptionPlanId);
    const targetPlan = subscriptionPlans.find(({ id }) => id === targetSkuId);

    const currentSku = logtoSkus.find(({ id }) => id === currentSkuId);
    const targetSku = logtoSkus.find(({ id }) => id === targetSkuId);

    if (!currentPlan || !targetPlan || !currentSku || !targetSku) {
      return;
    }

    if (isDowngrade) {
      const [result] = await show({
        ModalContent: () => (
          <DowngradeConfirmModalContent
            currentPlan={currentPlan}
            targetPlan={targetPlan}
            currentSku={currentSku}
            targetSku={targetSku}
          />
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
      setCurrentLoadingPlanId(targetSkuId);
      if (targetSkuId === ReservedPlanId.Free) {
        await cancelSubscription(currentTenantId);
        await onSubscriptionUpdated();
        toast.success(
          <Trans components={{ name: <PlanName skuId={targetSku.id} name={targetPlan.name} /> }}>
            {t('downgrade_success')}
          </Trans>
        );

        return;
      }

      await subscribe({
        tenantId: currentTenantId,
        skuId: targetSku.id,
        planId: targetSkuId,
        isDowngrade,
        callbackPage: subscriptionPage,
      });
    } catch (error: unknown) {
      setCurrentLoadingPlanId(undefined);

      const [result, exceededSkuQuotaKeys] = await parseExceededSkuQuotaLimitError(error);

      if (result) {
        await show({
          ModalContent: () => (
            <NotEligibleSwitchSkuModalContent
              targetSku={targetSku}
              isDowngrade={isDowngrade}
              exceededSkuQuotaKeys={exceededSkuQuotaKeys}
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
      {logtoSkus.map(({ id: skuId }) => {
        const isCurrentSku = currentSkuId === skuId;
        const isDowngrade = isDowngradePlan(currentSkuId, skuId);

        return (
          <div key={skuId}>
            <Button
              title={
                isCurrentSku
                  ? 'subscription.current'
                  : isDowngrade
                  ? 'subscription.downgrade'
                  : 'subscription.upgrade'
              }
              type={isDowngrade ? 'default' : 'primary'}
              disabled={isCurrentSku}
              isLoading={!isCurrentSku && currentLoadingPlanId === skuId}
              onClick={() => {
                void handleSubscribe(skuId, isDowngrade);
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
