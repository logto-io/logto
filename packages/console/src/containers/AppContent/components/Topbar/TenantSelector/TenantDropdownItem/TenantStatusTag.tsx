import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';

import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import useInvoices from '@/hooks/use-invoices';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import useSubscriptionUsage from '@/hooks/use-subscription-usage';
import { getLatestUnpaidInvoice } from '@/utils/subscription';

type Props = {
  tenantId: string;
  className?: string;
};

function TenantStatusTag({ tenantId, className }: Props) {
  const { data: usage, error: fetchUsageError } = useSubscriptionUsage(tenantId);
  const { data: invoices, error: fetchInvoiceError } = useInvoices(tenantId);
  const { data: subscriptionPlan, error: fetchSubscriptionError } = useSubscriptionPlan(tenantId);

  const isLoadingUsage = !usage && !fetchUsageError;
  const isLoadingInvoice = !invoices && !fetchInvoiceError;
  const isLoadingSubscription = !subscriptionPlan && !fetchSubscriptionError;

  const latestUnpaidInvoice = useMemo(
    () => conditional(invoices && getLatestUnpaidInvoice(invoices)),
    [invoices]
  );

  if (isLoadingUsage || isLoadingInvoice || isLoadingSubscription) {
    return null;
  }

  /**
   * Tenant status priority:
   * 1. suspend (WIP) @xiaoyijun
   * 2. overdue
   * 3. mau exceeded
   */

  if (invoices && latestUnpaidInvoice) {
    return (
      <Tag className={className}>
        <DynamicT forKey="tenants.status.overdue" />
      </Tag>
    );
  }

  if (subscriptionPlan && usage) {
    const { activeUsers } = usage;

    const {
      quota: { mauLimit },
    } = subscriptionPlan;

    const isMauExceeded = mauLimit !== null && activeUsers >= mauLimit;

    if (isMauExceeded) {
      return (
        <Tag className={className}>
          <DynamicT forKey="tenants.status.mau_exceeded" />
        </Tag>
      );
    }
  }

  return null;
}

export default TenantStatusTag;
