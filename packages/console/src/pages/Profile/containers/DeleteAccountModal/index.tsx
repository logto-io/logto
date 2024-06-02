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
            {
              description:
                'The following tenants have paid plans, please cancel the subscription first:',
              tenants: paidPlans,
            },
            {
              description: 'The following tenants have subscription issues:',
              tenants: subscriptionStatusIssues,
            },
            { description: 'The following tenants have open invoices:', tenants: openInvoices },
          ]}
        />
      ) : (
        <DeletionConfirmationModal />
      )}
    </ReactModal>
  );
}
