import { ReservedPlanId } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type LogtoSkuResponse } from '@/cloud/types/router';
import SkuName from '@/components/SkuName';
import { contactEmailLink, storageKeys } from '@/consts';
import { subscriptionPage } from '@/consts/pages';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import { NotEligibleSwitchSkuModalContent } from '@/pages/TenantSettings/components/NotEligibleSwitchPlanModalContent';
import {
  isDowngradePlan,
  isEquivalentPlan,
  parseExceededSkuQuotaLimitError,
} from '@/utils/subscription';

import CancelFeedbackModal from '../CancelFeedbackModal';
import DowngradeConfirmModalContent from '../DowngradeConfirmModalContent';

import styles from './index.module.scss';

const getCancelFeedbackStorageKey = (tenantId: string) =>
  `${storageKeys.subscriptionCancelFeedbackSubmitted}:${tenantId}`;

type SkuButtonProps = {
  readonly targetSkuId: string;
  readonly currentSkuId: string;
  readonly isCurrentEnterprisePlan: boolean;
  readonly loadingSkuId?: string;
  readonly onClick: (targetSkuId: string, isDowngrade: boolean) => Promise<void>;
};

function SkuButton({
  targetSkuId,
  currentSkuId,
  isCurrentEnterprisePlan,
  loadingSkuId,
  onClick,
}: SkuButtonProps) {
  const isCurrentSku = currentSkuId === targetSkuId;
  const isDowngrade = isDowngradePlan(currentSkuId, targetSkuId);
  const isEquivalent = isEquivalentPlan(currentSkuId, targetSkuId);

  if (isCurrentEnterprisePlan || isEquivalent) {
    return (
      <div>
        <a href={contactEmailLink} className={styles.buttonLink} rel="noopener">
          <Button title="general.contact_us_action" />
        </a>
      </div>
    );
  }

  return (
    <div>
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
        isLoading={!isCurrentSku && loadingSkuId === targetSkuId}
        onClick={() => {
          void onClick(targetSkuId, isDowngrade);
        }}
      />
    </div>
  );
}

type Props = {
  readonly currentSkuId: string;
  readonly logtoSkus: LogtoSkuResponse[];
  readonly onSubscriptionUpdated: () => Promise<void>;
};
function SwitchPlanActionBar({ onSubscriptionUpdated, currentSkuId, logtoSkus }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const { currentTenantId } = useContext(TenantsContext);
  const {
    currentSku,
    currentSubscription: { isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const { subscribe, cancelSubscription } = useSubscribe();
  const { show } = useConfirmModal();
  const [currentLoadingSkuId, setCurrentLoadingSkuId] = useState<string>();
  const [preCancelTargetSku, setPreCancelTargetSku] = useState<LogtoSkuResponse>();
  const [canceledSkuId, setCanceledSkuId] = useState<string>();

  const switchSku = async (targetSku: LogtoSkuResponse, isDowngrade: boolean) => {
    const { id: targetSkuId } = targetSku;

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

        const feedbackStorageKey = getCancelFeedbackStorageKey(currentTenantId);
        const hasSubmittedFeedback = Boolean(
          trySafe(() => sessionStorage.getItem(feedbackStorageKey))
        );
        trySafe(() => {
          sessionStorage.removeItem(feedbackStorageKey);
        });

        if (!hasSubmittedFeedback) {
          setCanceledSkuId(currentSku.id);
        }

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

  const handleSubscribe = async (targetSkuId: string, isDowngrade: boolean) => {
    if (currentLoadingSkuId) {
      return;
    }

    const targetSku = logtoSkus.find(({ id }) => id === targetSkuId);

    if (!targetSku) {
      return;
    }

    if (
      targetSkuId === ReservedPlanId.Free &&
      !trySafe(() => sessionStorage.getItem(getCancelFeedbackStorageKey(currentTenantId)))
    ) {
      setPreCancelTargetSku(targetSku);
      return;
    }

    await switchSku(targetSku, isDowngrade);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.buttonPlaceholder} />
        {/** Public reserved plan buttons */}
        {logtoSkus.map(({ id: skuId }) => {
          return (
            <SkuButton
              key={skuId}
              targetSkuId={skuId}
              currentSkuId={currentSkuId}
              isCurrentEnterprisePlan={isEnterprisePlan}
              loadingSkuId={currentLoadingSkuId}
              onClick={handleSubscribe}
            />
          );
        })}
        {/** Enterprise plan button */}
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
      {preCancelTargetSku && (
        <CancelFeedbackModal
          isOpen
          fromSkuId={currentSku.id}
          stage="before_cancel"
          onClose={() => {
            setPreCancelTargetSku(undefined);
          }}
          onSubmit={(hasFeedback) => {
            if (hasFeedback) {
              trySafe(() => {
                sessionStorage.setItem(getCancelFeedbackStorageKey(currentTenantId), 'true');
              });
            }
            setPreCancelTargetSku(undefined);
            void switchSku(preCancelTargetSku, true);
          }}
        />
      )}
      {canceledSkuId && (
        <CancelFeedbackModal
          isOpen
          fromSkuId={canceledSkuId}
          stage="after_cancel"
          onClose={() => {
            setCanceledSkuId(undefined);
          }}
          onSubmit={() => {
            setCanceledSkuId(undefined);
          }}
        />
      )}
    </>
  );
}

export default SwitchPlanActionBar;
