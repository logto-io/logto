import { useContext, useMemo, useState } from 'react';
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

  const isEnterprise = currentTenant?.subscription.isEnterprisePlan;

  const handleCloseModal = () => {
    setHasClosed(true);
  };

  const hasOverdueInvoices = useMemo(() => {
    if (!isCloud || openInvoices.length === 0) {
      return false;
    }

    // Enterprise tenants' invoices are manually paid and has a due date in the future
    // Should show the modal only if the invoices are overdue.
    // Keep this for now as some legacy invoices data might not have the `collectionMethod` and `dueDate` fields
    // TODO: this is a temporary fix to hide the modal for enterprise tenants. Remove this after all legacy invoices are handled.
    if (isEnterprise) {
      return false;
    }

    return openInvoices.some(({ dueDate, collectionMethod }) => {
      switch (collectionMethod) {
        // For automatic collection method, consider open invoices always overdue
        case 'charge_automatically': {
          return true;
        }
        // For manual collection method, consider invoices overdue if past due date
        case 'send_invoice': {
          return dueDate && dueDate < new Date();
        }
        default: {
          // For legacy invoices without collection method, consider them overdue
          return true;
        }
      }
    });
  }, [isEnterprise, openInvoices]);

  if (!hasOverdueInvoices || hasClosed) {
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
