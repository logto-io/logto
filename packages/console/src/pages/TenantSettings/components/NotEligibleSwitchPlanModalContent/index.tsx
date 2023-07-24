import { conditional } from '@silverhand/essentials';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import {
  quotaItemLimitedPhrasesMap,
  quotaItemNotEligiblePhrasesMap,
} from '@/consts/quota-item-phrases';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlan, type SubscriptionPlanQuota } from '@/types/subscriptions';

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

  const { name, quota } = targetPlan;

  // eslint-disable-next-line no-restricted-syntax
  const entries = Object.entries(quota) as Array<
    [keyof SubscriptionPlanQuota, SubscriptionPlanQuota[keyof SubscriptionPlanQuota]]
  >;

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
      </div>
      <ul className={styles.list}>
        {entries.map(([quotaKey, quotaValue]) => {
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
