import { ReservedPlanId } from '@logto/schemas';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type LogtoSkuResponse } from '@/cloud/types/router';
import SkuName from '@/components/SkuName';
import { contactEmailLink } from '@/consts';
import { subscriptionPage } from '@/consts/pages';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import { NotEligibleSwitchSkuModalContent } from '@/pages/TenantSettings/components/NotEligibleSwitchPlanModalContent';
import { isDowngradePlan, parseExceededSkuQuotaLimitError } from '@/utils/subscription';

import DowngradeConfirmModalContent from '../DowngradeConfirmModalContent';

import styles from './index.module.scss';

type Props = {
  readonly currentSkuId: string;
  readonly logtoSkus: LogtoSkuResponse[];
  readonly onSubscriptionUpdated: () => Promise<void>;
};

function SwitchPlanActionBar({ onSubscriptionUpdated, currentSkuId, logtoSkus }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const { currentTenantId } = useContext(TenantsContext);
  const {
    currentSubscription: { isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const { subscribe, cancelSubscription } = useSubscribe();
  const { show } = useConfirmModal();
  const [currentLoadingSkuId, setCurrentLoadingSkuId] = useState<string>();

  const handleSubscribe = async (targetSkuId: string, isDowngrade: boolean) => {
    if (currentLoadingSkuId) {
      return;
    }

    const currentSku = logtoSkus.find(({ id }) => id === currentSkuId);
    const targetSku = logtoSkus.find(({ id }) => id === targetSkuId);

    if (!currentSku || !targetSku) {
      return;
    }

    if (isDowngrade) {
      const [result] = await show({
        ModalContent: () => (
          <DowngradeConfirmModalContent currentSku={currentSku} targetSku={targetSku} />
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
      setCurrentLoadingSkuId(targetSkuId);
      if (targetSkuId === ReservedPlanId.Free) {
        await cancelSubscription(currentTenantId);
        await onSubscriptionUpdated();
        toast.success(
          <Trans components={{ name: <SkuName skuId={targetSku.id} /> }}>
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
      setCurrentLoadingSkuId(undefined);

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
      setCurrentLoadingSkuId(undefined);
    }
  };

  return (
    <div className={styles.container}>
      <Spacer />
      {logtoSkus.map(({ id: skuId }) => {
        const isCurrentSku = currentSkuId === skuId;
        const isDowngrade = isDowngradePlan(currentSkuId, skuId);

        // Let user contact us when they are currently on Enterprise plan. Do not allow users to self-serve downgrade.
        return isEnterprisePlan ? (
          <div>
            <a href={contactEmailLink} className={styles.buttonLink} rel="noopener">
              <Button title="general.contact_us_action" />
            </a>
          </div>
        ) : (
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
              isLoading={!isCurrentSku && currentLoadingSkuId === skuId}
              onClick={() => {
                void handleSubscribe(skuId, isDowngrade);
              }}
            />
          </div>
        );
      })}
      <div>
        <a href={contactEmailLink} className={styles.buttonLink} rel="noopener">
          <Button
            title={isEnterprisePlan ? 'subscription.current' : 'general.contact_us_action'}
            type="primary"
            disabled={isEnterprisePlan}
          />
        </a>
      </div>
    </div>
  );
}

export default SwitchPlanActionBar;
