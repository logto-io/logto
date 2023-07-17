import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import { type SubscriptionPlan } from '@/types/subscriptions';

type Props = {
  activeUsers: number;
  currentPlan: SubscriptionPlan;
  className?: string;
};

function MauLimitExceededNotification({ activeUsers, currentPlan, className }: Props) {
  const {
    quota: { mauLimit },
  } = currentPlan;
  if (
    !mauLimit || // Unlimited
    activeUsers < mauLimit
  ) {
    return null;
  }

  return (
    <InlineNotification
      severity="error"
      action="subscription.upgrade_pro"
      className={className}
      onClick={() => {
        // Todo @xiaoyijun Implement buy plan
      }}
    >
      <DynamicT forKey="subscription.overfill_quota_warning" />
    </InlineNotification>
  );
}

export default MauLimitExceededNotification;
