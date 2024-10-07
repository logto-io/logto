import { cond } from '@silverhand/essentials';
import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import PlanUsage from '@/components/PlanUsage';
import { contactEmailLink } from '@/consts';
import { subscriptionPage } from '@/consts/pages';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import modalStyles from '@/scss/modal.module.scss';

import SkuName from '../SkuName';

import styles from './index.module.scss';

function MauExceededModal() {
  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const { currentTenant } = useContext(TenantsContext);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

  const [hasClosed, setHasClosed] = useState(false);
  const handleCloseModal = () => {
    setHasClosed(true);
  };

  if (hasClosed) {
    return null;
  }

  const isMauExceeded =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, prettier/prettier
    cond(currentTenant && currentTenant.quota.mauLimit !== null &&
        currentTenant.usage.activeUsers >= currentTenant.quota.mauLimit
    );

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
            <a href={contactEmailLink} className={styles.linkButton} rel="noopener">
              <Button title="general.contact_us_action" />
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
              planName: <SkuName skuId={planId} isEnterprisePlan={isEnterprisePlan} />,
            }}
          >
            {t('upsell.mau_exceeded_modal.notification')}
          </Trans>
        </InlineNotification>
        <FormField title="subscription.plan_usage">
          <PlanUsage />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default MauExceededModal;
