import { conditional } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';

import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import useInvoices from '@/hooks/use-invoices';
import useSubscribe from '@/hooks/use-subscribe';
import { getLatestUnpaidInvoice } from '@/utils/subscription';

type Props = {
  className?: string;
};

function PaymentOverdueNotification({ className }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { visitManagePaymentPage } = useSubscribe();
  const { data: invoices, error } = useInvoices(currentTenantId);
  const isLoadingInvoices = !invoices && !error;
  const latestUnpaidInvoice = useMemo(
    () => conditional(invoices && getLatestUnpaidInvoice(invoices)),
    [invoices]
  );

  if (isLoadingInvoices || !latestUnpaidInvoice) {
    return null;
  }

  return (
    <InlineNotification
      severity="error"
      action="subscription.update_payment"
      className={className}
      onClick={() => {
        void visitManagePaymentPage(currentTenantId);
      }}
    >
      <DynamicT
        forKey="subscription.payment_error"
        interpolation={{ price: latestUnpaidInvoice.amountDue / 100 }}
      />
    </InlineNotification>
  );
}

export default PaymentOverdueNotification;
