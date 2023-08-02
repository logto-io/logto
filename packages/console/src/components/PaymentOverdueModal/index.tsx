import { conditional } from '@silverhand/essentials';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { contactEmailLink } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import useInvoices from '@/hooks/use-invoices';
import useSubscribe from '@/hooks/use-subscribe';
import * as modalStyles from '@/scss/modal.module.scss';
import { getLatestUnpaidInvoice } from '@/utils/subscription';

import BillInfo from '../BillInfo';

import * as styles from './index.module.scss';

function PaymentOverdueModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { currentTenant, currentTenantId } = useContext(TenantsContext);
  const { data: invoices, error } = useInvoices(currentTenantId);
  const { visitManagePaymentPage } = useSubscribe();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const isLoadingInvoices = !invoices && !error;

  const latestUnpaidInvoice = useMemo(() => {
    return conditional(invoices && getLatestUnpaidInvoice(invoices));
  }, [invoices]);

  const [hasClosed, setHasClosed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseModal = () => {
    setHasClosed(true);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isLoadingInvoices || hasClosed) {
      return;
    }

    if (latestUnpaidInvoice) {
      setIsOpen(true);
    }
  }, [hasClosed, isLoadingInvoices, latestUnpaidInvoice]);

  if (isLoadingInvoices || !latestUnpaidInvoice || hasClosed) {
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
