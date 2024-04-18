import { useContext, useState } from 'react';

import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import useSubscribe from '@/hooks/use-subscribe';

type Props = {
  readonly className?: string;
};

function PaymentOverdueNotification({ className }: Props) {
  const { currentTenant, currentTenantId } = useContext(TenantsContext);
  const { openInvoices = [] } = currentTenant ?? {};
  const { visitManagePaymentPage } = useSubscribe();
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (openInvoices.length === 0) {
    return null;
  }

  const totalAmountDue = openInvoices.reduce(
    (total, currentInvoice) => total + currentInvoice.amountDue,
    0
  );

  return (
    <InlineNotification
      severity="error"
      action="subscription.update_payment"
      className={className}
      isActionLoading={isActionLoading}
      onClick={async () => {
        setIsActionLoading(true);
        await visitManagePaymentPage(currentTenantId);
        setIsActionLoading(false);
      }}
    >
      <DynamicT
        forKey="subscription.payment_error"
        interpolation={{ price: totalAmountDue / 100 }}
      />
    </InlineNotification>
  );
}

export default PaymentOverdueNotification;
