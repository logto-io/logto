import { ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import ReactModal from 'react-modal';

import { TenantsContext } from '@/contexts/TenantsProvider';
import * as modalStyles from '@/scss/modal.module.scss';

import DeletionConfirmationModal from './components/DeletionConfirmationModal';
import TenantsIssuesModal from './components/TenantsIssuesModal';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

export default function DeleteAccountModal({ isOpen, onClose }: Props) {
  const { tenants } = useContext(TenantsContext);
  const paidPlans = tenants.filter(
    ({ planId }) => planId !== ReservedPlanId.Free && planId !== ReservedPlanId.Development
  );
  const subscriptionStatusIssues = tenants.filter(
    ({ subscription }) => subscription.status !== 'active'
  );
  const openInvoices = tenants.filter(({ openInvoices }) => openInvoices.length > 0);
  const hasIssues =
    paidPlans.length > 0 || subscriptionStatusIssues.length > 0 || openInvoices.length > 0;

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      {hasIssues ? (
        <TenantsIssuesModal
          issues={[
            { description: 'paid_plan', tenants: paidPlans },
            { description: 'subscription_status', tenants: subscriptionStatusIssues },
            { description: 'open_invoice', tenants: openInvoices },
          ]}
          onClose={onClose}
        />
      ) : (
        <DeletionConfirmationModal onClose={onClose} />
      )}
    </ReactModal>
  );
}
