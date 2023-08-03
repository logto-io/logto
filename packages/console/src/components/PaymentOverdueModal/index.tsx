import { conditional } from '@silverhand/essentials';
import { useContext, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { contactEmailLink } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import useSubscribe from '@/hooks/use-subscribe';
import * as modalStyles from '@/scss/modal.module.scss';
import { getLatestUnpaidInvoice } from '@/utils/subscription';

import BillInfo from '../BillInfo';

import * as styles from './index.module.scss';

function PaymentOverdueModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { currentTenant, currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi();
  const { data: invoicesResponse } = useSWRImmutable(
    `/api/tenants/${currentTenantId}/invoices`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invoices', { params: { tenantId: currentTenantId } })
  );
  const { visitManagePaymentPage } = useSubscribe();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const latestUnpaidInvoice = useMemo(
    () => conditional(invoicesResponse && getLatestUnpaidInvoice(invoicesResponse.invoices)),
    [invoicesResponse]
  );

  const [hasClosed, setHasClosed] = useState(false);
  const handleCloseModal = () => {
    setHasClosed(true);
  };

  if (!invoicesResponse || !latestUnpaidInvoice || hasClosed) {
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
        title="upsell.payment_overdue_modal.title"
        footer={
          <>
            <a href={contactEmailLink} target="_blank" className={styles.linkButton} rel="noopener">
              <Button title="general.contact_us_action" />
            </a>
            <Button
              type="primary"
              title="upsell.payment_overdue_modal.update_payment"
              isLoading={isActionLoading}
              onClick={async () => {
                setIsActionLoading(true);
                await visitManagePaymentPage(currentTenantId);
                setIsActionLoading(false);
              }}
            />
          </>
        }
        onClose={handleCloseModal}
      >
        {currentTenant && (
          <InlineNotification severity="error">
            <Trans components={{ span: <span className={styles.strong} /> }}>
              {t('upsell.payment_overdue_modal.notification', { name: currentTenant.name })}
            </Trans>
          </InlineNotification>
        )}
        <FormField title="upsell.payment_overdue_modal.unpaid_bills">
          <BillInfo cost={latestUnpaidInvoice.amountDue} />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default PaymentOverdueModal;
