import { ReservedPlanId } from '@logto/schemas';
import { type TFuncKey } from 'i18next';
import { useContext } from 'react';

import { isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';

type Props = {
  hasReachedLimit: boolean;
  notification?: TFuncKey<'translation', 'admin_console.upsell'>;
  className?: string;
};

/**
 * Charge notification for add-on quota limit features
 *
 * CAUTION: This notification will be rendered only when the tenant's subscription plan is a paid plan.
 * We won't render it for free plan since we will not charge for free plan.
 */
function ChargeNotification({
  hasReachedLimit,
  notification = 'charge_notification_for_quota_limit',
  className,
}: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);

  if (
    // Todo @xiaoyijun [Pricing] Remove feature flag
    isDevFeaturesEnabled &&
    // No charge notification for free plan
    (!hasReachedLimit || currentPlan?.id === ReservedPlanId.Free)
  ) {
    return null;
  }

  return (
    <InlineNotification severity="error" className={className}>
      <DynamicT forKey={`upsell.${notification}`} />
    </InlineNotification>
  );
}

export default ChargeNotification;
