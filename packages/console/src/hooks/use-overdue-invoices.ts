import dayjs from 'dayjs';
import { useMemo } from 'react';

import { type TenantResponse } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';

function useOverdueInvoices(tenantData: TenantResponse | undefined) {
  const { openInvoices = [] } = tenantData ?? {};
  const isEnterprise = tenantData?.subscription.isEnterprisePlan;

  const overdueInvoices = useMemo(
    () =>
      openInvoices.filter(({ dueDate, collectionMethod }) => {
        switch (collectionMethod) {
          // For automatic collection method, consider open invoices always overdue
          case 'charge_automatically': {
            return true;
          }
          // For manual collection method, consider invoices overdue if past due date
          case 'send_invoice': {
            return dueDate && dayjs().isAfter(dayjs(dueDate));
          }
          default: {
            // For legacy invoices without collection method, consider them overdue
            return true;
          }
        }
      }),
    [openInvoices]
  );

  const hasOverdueInvoices = useMemo(() => {
    if (!isCloud) {
      return false;
    }

    // Enterprise tenants' invoices are manually paid and has a due date in the future
    // Should show the modal only if the invoices are overdue.
    // Keep this for now as some legacy invoices data might not have the `collectionMethod` and `dueDate` fields
    // TODO: this is a temporary fix to hide the modal for enterprise tenants. Remove this after all legacy invoices are handled.
    if (isEnterprise) {
      return false;
    }

    return overdueInvoices.length > 0;
  }, [isEnterprise, overdueInvoices]);

  return useMemo(
    () => ({
      hasOverdueInvoices,
      overdueInvoices,
      openInvoices,
    }),
    [hasOverdueInvoices, openInvoices, overdueInvoices]
  );
}

export default useOverdueInvoices;
