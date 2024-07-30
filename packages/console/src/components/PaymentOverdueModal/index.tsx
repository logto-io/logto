import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { contactEmailLink } from '@/consts';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import ModalLayout from '@/ds-components/ModalLayout';
import useSubscribe from '@/hooks/use-subscribe';
import modalStyles from '@/scss/modal.module.scss';

import BillInfo from '../BillInfo';

import styles from './index.module.scss';

function PaymentOverdueModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { currentTenant, currentTenantId } = useContext(TenantsContext);
  const { openInvoices = [] } = currentTenant ?? {};

  const { visitManagePaymentPage } = useSubscribe();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [hasClosed, setHasClosed] = useState(false);
  const handleCloseModal = () => {
    setHasClosed(true);
  };

  if (!isCloud || openInvoices.length === 0 || hasClosed) {
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
            <a href={contactEmailLink} className={styles.linkButton} rel="noopener">
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
          <BillInfo
            cost={openInvoices.reduce(
              (total, currentInvoice) => total + currentInvoice.amountDue,
              0
            )}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default PaymentOverdueModal;
