import { useContext, useMemo } from 'react';

import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

function useOverdueInvoices() {
  const { currentTenant } = useContext(TenantsContext);
  const { openInvoices = [] } = currentTenant ?? {};
  const isEnterprise = currentTenant?.subscription.isEnterprisePlan;

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

  return useMemo(
    () => ({
      hasOverdueInvoices,
      openInvoices,
    }),
    [hasOverdueInvoices, openInvoices]
  );
}

export default useOverdueInvoices;
