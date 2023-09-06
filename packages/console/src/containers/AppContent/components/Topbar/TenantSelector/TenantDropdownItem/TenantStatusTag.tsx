import { type TenantResponse } from '@/cloud/types/router';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import { type SubscriptionPlan } from '@/types/subscriptions';

type Props = {
  tenantData: TenantResponse;
  tenantPlan: SubscriptionPlan;
  className?: string;
};

function TenantStatusTag({ tenantData, tenantPlan, className }: Props) {
  const { usage, openInvoices } = tenantData;

  /**
   * Tenant status priority:
   * 1. suspend (WIP) @xiaoyijun
   * 2. overdue
   * 3. mau exceeded
   */

  if (openInvoices.length > 0) {
    return (
      <Tag className={className}>
        <DynamicT forKey="tenants.status.overdue" />
      </Tag>
    );
  }

  const { activeUsers } = usage;

  const {
    quota: { mauLimit },
  } = tenantPlan;

  const isMauExceeded = mauLimit !== null && activeUsers >= mauLimit;

  if (isMauExceeded) {
    return (
      <Tag className={className}>
        <DynamicT forKey="tenants.status.mau_exceeded" />
      </Tag>
    );
  }

  return null;
}

export default TenantStatusTag;
