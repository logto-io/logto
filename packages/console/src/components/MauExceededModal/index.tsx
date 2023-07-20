import { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import PlanUsage from '@/components/PlanUsage';
import { contactEmailLink } from '@/consts';
import { subscriptionPage } from '@/consts/pages';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import useSubscription from '@/hooks/use-subscription';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import useSubscriptionUsage from '@/hooks/use-subscription-usage';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import PlanName from '../PlanName';

import * as styles from './index.module.scss';

function MauExceededModal() {
  const { currentTenantId } = useContext(TenantsContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const [hasClosed, setHasClosed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseModal = () => {
    setHasClosed(true);
    setIsOpen(false);
  };

  const { data: currentUsage, error: fetchUsageError } = useSubscriptionUsage(currentTenantId);
  const { data: currentSubscription, error: fetchSubscriptionError } =
    useSubscription(currentTenantId);
  const { data: currentPlan, error: fetchCurrentPlanError } = useSubscriptionPlan(currentTenantId);

  const isLoadingUsage = !currentUsage && !fetchUsageError;
  const isLoadingSubscription = !currentSubscription && !fetchSubscriptionError;
  const isLoadingCurrentPlan = !currentPlan && !fetchCurrentPlanError;

  useEffect(() => {
    if (!currentUsage || !currentPlan || hasClosed) {
      return;
    }

    const {
      quota: { mauLimit },
    } = currentPlan;

    if (mauLimit === null) {
      return;
    }

    if (currentUsage.activeUsers >= mauLimit) {
      setIsOpen(true);
    }
  }, [currentPlan, currentUsage, hasClosed]);

  if (isLoadingUsage || isLoadingSubscription || isLoadingCurrentPlan) {
    return null;
  }

  if (!currentUsage || !currentSubscription || !currentPlan) {
    return null;
  }

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={handleCloseModal}
    >
      <ModalLayout
        title="upsell.mau_exceeded_modal.title"
        footer={
          <>
            <a href={contactEmailLink} target="_blank" className={styles.linkButton} rel="noopener">
              <Button title="upsell.contact_us" />
            </a>
            <Button
              type="primary"
              title="upsell.upgrade_plan"
              onClick={() => {
                navigate(subscriptionPage);
                handleCloseModal();
              }}
            />
          </>
        }
        onClose={handleCloseModal}
      >
        <InlineNotification severity="error">
          <Trans
            components={{
              planName: <PlanName name={currentPlan.name} />,
            }}
          >
            {t('upsell.mau_exceeded_modal.notification')}
          </Trans>
        </InlineNotification>
        <FormField title="subscription.plan_usage">
          <PlanUsage
            subscriptionUsage={currentUsage}
            currentSubscription={currentSubscription}
            currentPlan={currentPlan}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default MauExceededModal;
