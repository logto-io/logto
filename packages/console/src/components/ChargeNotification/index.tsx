import { type AdminConsoleData, ReservedPlanId } from '@logto/schemas';
import { cond, type Truthy } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { newPlansBlogLink } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useConfigs from '@/hooks/use-configs';

type Props = {
  readonly hasSurpassedLimit: boolean;
  readonly quotaItemPhraseKey: TFuncKey<'translation', 'admin_console.upsell.add_on_quota_item'>;
  readonly quotaLimit?: number;
  readonly className?: string;
  /**
   * The key of the flag in `checkedChargeNotification` config from the AdminConsoleData.
   * Used to determine whether the notification has been checked.
   * @see{@link AdminConsoleData}
   */
  readonly checkedFlagKey: keyof Truthy<AdminConsoleData['checkedChargeNotification']>;
};

/**
 * Charge notification for add-on quota limit features
 *
 * CAUTION:
 * - This notification will be rendered only when the tenant's subscription plan is a paid plan. We won't render it for free plan since we will not charge for free plan.
 * - If the notification has been marked as checked, it will not be rendered.
 */
function ChargeNotification({
  hasSurpassedLimit,
  quotaItemPhraseKey,
  quotaLimit,
  className,
  checkedFlagKey,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell' });
  const { currentPlan, currentSku } = useContext(SubscriptionDataContext);
  const { configs, updateConfigs } = useConfigs();

  // Display null when loading
  if (!configs) {
    return null;
  }

  const { checkedChargeNotification } = configs;

  if (
    Boolean(checkedChargeNotification?.[checkedFlagKey]) ||
    !hasSurpassedLimit ||
    // No charge notification for free plan
    (isDevFeaturesEnabled ? currentSku.id : currentPlan.id) === ReservedPlanId.Free
  ) {
    return null;
  }

  return (
    <InlineNotification
      className={className}
      action="general.got_it"
      onClick={() => {
        void updateConfigs({
          checkedChargeNotification: {
            ...checkedChargeNotification,
            [checkedFlagKey]: true,
          },
        });
      }}
    >
      <Trans components={{ a: <TextLink href={newPlansBlogLink} targetBlank="noopener" /> }}>
        {t('charge_notification_for_quota_limit', {
          item: t(`add_on_quota_item.${quotaItemPhraseKey}`, {
            ...cond(
              // Note: tokens use 'M' as unit
              quotaLimit && {
                limit: quotaItemPhraseKey === 'tokens' ? quotaLimit / 1_000_000 : quotaLimit,
              }
            ),
          }),
        })}
      </Trans>
    </InlineNotification>
  );
}

export default ChargeNotification;
