import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import { isDevFeaturesEnabled } from '@/consts/env';
import { planQuotaItemOrder } from '@/consts/plan-quotas';
import {
  quotaItemLimitedPhrasesMap,
  quotaItemNotEligiblePhrasesMap,
} from '@/consts/quota-item-phrases';
import { ReservedPlanId } from '@/consts/subscriptions';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlan, type SubscriptionPlanQuota } from '@/types/subscriptions';
import { sortBy } from '@/utils/sort';

import * as styles from './index.module.scss';

const excludedQuotaKeys = new Set<keyof SubscriptionPlanQuota>([
  'auditLogsRetentionDays',
  'communitySupportEnabled',
  'ticketSupportResponseTime',
]);

type Props = {
  targetPlan: SubscriptionPlan;
  isDowngrade?: boolean;
};

function NotEligibleSwitchPlanModalContent({ targetPlan, isDowngrade = false }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.subscription.not_eligible_modal',
  });

  const {
    id,
    name,
    quota: fullQuota,
    quota: { mfaEnabled, ...quotaWithoutMfa },
  } = targetPlan;

  const quota = isDevFeaturesEnabled ? fullQuota : quotaWithoutMfa;

  const orderedEntries = useMemo(() => {
    // eslint-disable-next-line no-restricted-syntax
    const entries = Object.entries(quota) as Array<
      [keyof SubscriptionPlanQuota, SubscriptionPlanQuota[keyof SubscriptionPlanQuota]]
    >;
    return entries
      .slice()
      .sort(([preQuotaKey], [nextQuotaKey]) =>
        sortBy(planQuotaItemOrder)(preQuotaKey, nextQuotaKey)
      );
  }, [quota]);

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Trans
          components={{
            name: <PlanName name={name} />,
          }}
        >
          {t(isDowngrade ? 'downgrade_description' : 'upgrade_description')}
        </Trans>
        {!isDowngrade && id === ReservedPlanId.hobby && t('upgrade_pro_tip')}
      </div>
      <ul className={styles.list}>
        {orderedEntries.map(([quotaKey, quotaValue]) => {
          if (
            excludedQuotaKeys.has(quotaKey) ||
            quotaValue === null || // Unlimited items
            quotaValue === true // Eligible items
          ) {
            return null;
          }

          return (
            <li key={quotaKey}>
              {quotaValue ? (
                <Trans
                  components={{
                    item: (
                      <DynamicT
                        forKey={`subscription.quota_item.${quotaItemLimitedPhrasesMap[quotaKey]}`}
                        interpolation={conditional(
                          typeof quotaValue === 'number' && { count: quotaValue }
                        )}
                      />
                    ),
                  }}
                >
                  {t('a_maximum_of')}
                </Trans>
              ) : (
                <DynamicT
                  forKey={`subscription.quota_item.${quotaItemNotEligiblePhrasesMap[quotaKey]}`}
                />
              )}
            </li>
          );
        })}
      </ul>
      <Trans
        components={{
          a: <ContactUsPhraseLink />,
        }}
      >
        {t(isDowngrade ? 'downgrade_help_tip' : 'upgrade_help_tip')}
      </Trans>
    </div>
  );
}

export default NotEligibleSwitchPlanModalContent;
