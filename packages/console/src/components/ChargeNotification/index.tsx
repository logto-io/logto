import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { pricingLink } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';

type Props = {
  hasSurpassedLimit: boolean;
  quotaItem: TFuncKey<'translation', 'admin_console.upsell.add_on_quota_item'>;
  quotaLimit?: number;
  className?: string;
};

/**
 * Charge notification for add-on quota limit features
 *
 * CAUTION: This notification will be rendered only when the tenant's subscription plan is a paid plan.
 * We won't render it for free plan since we will not charge for free plan.
 */
function ChargeNotification({ hasSurpassedLimit, quotaItem, quotaLimit, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell' });
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);

  if (
    !hasSurpassedLimit ||
    // No charge notification for free plan
    currentPlan?.id === ReservedPlanId.Free
  ) {
    return null;
  }

  return (
    <InlineNotification className={className}>
      <Trans components={{ a: <TextLink href={pricingLink} targetBlank="noopener" /> }}>
        {t('charge_notification_for_quota_limit', {
          item: t(`add_on_quota_item.${quotaItem}`, {
            ...cond(
              // Note: tokens use 'M' as unit
              quotaLimit && { limit: quotaItem === 'tokens' ? quotaLimit / 1_000_000 : quotaLimit }
            ),
          }),
        })}
      </Trans>
    </InlineNotification>
  );
}

export default ChargeNotification;
