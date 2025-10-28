import { type TenantResponse } from '@/cloud/types/router';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import useOverdueInvoices from '@/hooks/use-overdue-invoices';
import { isPaidPlan } from '@/utils/subscription';

type Props = {
  readonly tenantData: TenantResponse;
  readonly className?: string;
};

function TenantStatusTag({ tenantData, className }: Props) {
  const {
    usage,
    quota,
    isSuspended,
    subscription: { planId, isEnterprisePlan },
  } = tenantData;

  const { hasOverdueInvoices } = useOverdueInvoices(tenantData);

  /**
   * Tenant status priority:
   * 1. suspend
   * 2. overdue
   * 3. mau exceeded
   * 4. token exceeded
   */

  if (isSuspended) {
    return (
      <Tag className={className}>
        <DynamicT forKey="user_details.suspended" />
      </Tag>
    );
  }

  if (hasOverdueInvoices) {
    return (
      <Tag className={className}>
        <DynamicT forKey="tenants.status.overdue" />
      </Tag>
    );
  }

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  const { activeUsers, tokenUsage } = usage;

  const { mauLimit, tokenLimit } = quota;

  const isMauExceeded = mauLimit !== null && activeUsers >= mauLimit;
  const isTokenExceeded = tokenLimit !== null && !isPaidTenant && tokenUsage >= tokenLimit;

  if (isMauExceeded) {
    return (
      <Tag className={className}>
        <DynamicT forKey="tenants.status.mau_exceeded" />
      </Tag>
    );
  }

  if (isTokenExceeded) {
    return (
      <Tag className={className}>
        <DynamicT forKey="tenants.status.token_exceeded" />
      </Tag>
    );
  }

  return null;
}

export default TenantStatusTag;
