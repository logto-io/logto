import { conditional } from '@silverhand/essentials';
import { useContext, useMemo, useState } from 'react';
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
import { isPaidPlan } from '@/utils/subscription';

import SkuName from '../SkuName';

import styles from './index.module.scss';

function MauTokenExceededModal() {
  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const { currentTenant } = useContext(TenantsContext);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

  const isPaidSubscriptionPlan = useMemo(
    () => isPaidPlan(planId, isEnterprisePlan),
    [planId, isEnterprisePlan]
  );

  const [hasClosed, setHasClosed] = useState(false);
  const handleCloseModal = () => {
    setHasClosed(true);
  };

  const periodicUsage = useMemo(
    () =>
      conditional(
        currentTenant && {
          mauLimit: currentTenant.usage.activeUsers,
          tokenLimit: currentTenant.usage.tokenUsage,
          userTokenLimit: currentTenant.usage.userTokenUsage,
          m2mTokenLimit: currentTenant.usage.m2mTokenUsage,
        }
      ),
    [currentTenant]
  );

  const isMauExceeded = conditional(
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    currentTenant &&
      currentTenant.quota.mauLimit !== null &&
      currentTenant.usage.activeUsers >= currentTenant.quota.mauLimit
  );

  const isTokenExceeded = conditional(
    currentTenant &&
      // Token usage add-on will be automatically applied for paid plans
      !isPaidSubscriptionPlan &&
      currentTenant.quota.tokenLimit !== null &&
      currentTenant.usage.tokenUsage >= currentTenant.quota.tokenLimit
  );

  if (hasClosed || (!isMauExceeded && !isTokenExceeded)) {
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
        title={`upsell.${isTokenExceeded ? 'token' : 'mau'}_exceeded_modal.title`}
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
        {isMauExceeded && (
          <InlineNotification severity="error">
            <Trans
              components={{
                planName: <SkuName skuId={planId} />,
              }}
            >
              {t('upsell.mau_exceeded_modal.notification')}
            </Trans>
          </InlineNotification>
        )}
        {isTokenExceeded && (
          <InlineNotification severity="error">
            <Trans
              components={{
                planName: <SkuName skuId={planId} />,
              }}
            >
              {t('upsell.token_exceeded_modal.notification')}
            </Trans>
          </InlineNotification>
        )}
        <FormField title="subscription.plan_usage">
          <PlanUsage periodicUsage={periodicUsage} />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default MauTokenExceededModal;
