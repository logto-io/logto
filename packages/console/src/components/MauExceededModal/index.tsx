import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import PlanUsage from '@/components/PlanUsage';
import { contactEmailLink } from '@/consts';
import { subscriptionPage } from '@/consts/pages';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import PlanName from '../PlanName';

import * as styles from './index.module.scss';

function MauExceededModal() {
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const [hasClosed, setHasClosed] = useState(false);

  const handleCloseModal = () => {
    setHasClosed(true);
  };

  const { data: subscriptionPlans } = useSubscriptionPlans();

  const { data: currentSubscription } = useSWRImmutable(
    `/api/tenants/${currentTenantId}/subscription`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription', { params: { tenantId: currentTenantId } })
  );

  const { data: currentUsage } = useSWRImmutable(
    `/api/tenants/${currentTenantId}/usage`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/usage', { params: { tenantId: currentTenantId } })
  );

  const currentPlan =
    currentSubscription &&
    subscriptionPlans?.find((plan) => plan.id === currentSubscription.planId);

  if (!currentPlan || !currentUsage || hasClosed) {
    return null;
  }

  const {
    quota: { mauLimit },
    name: planName,
  } = currentPlan;

  const isMauExceeded = mauLimit !== null && currentUsage.activeUsers >= mauLimit;

  if (!isMauExceeded) {
    return null;
  }

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
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
              planName: <PlanName name={planName} />,
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
