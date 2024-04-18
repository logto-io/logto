import { type TenantResponse } from '@/cloud/types/router';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import { type SubscriptionPlan } from '@/types/subscriptions';

type Props = {
  readonly tenantData: TenantResponse;
  readonly tenantPlan: SubscriptionPlan;
  readonly className?: string;
};

function TenantStatusTag({ tenantData, tenantPlan, className }: Props) {
  const { usage, openInvoices, isSuspended } = tenantData;

  /**
   * Tenant status priority:
   * 1. suspend
   * 2. overdue
   * 3. mau exceeded
   */

  if (isSuspended) {
    return (
      <Tag className={className}>
        <DynamicT forKey="user_details.suspended" />
      </Tag>
    );
  }

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
