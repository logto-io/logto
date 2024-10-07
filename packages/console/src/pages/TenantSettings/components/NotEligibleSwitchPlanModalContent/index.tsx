import { ReservedPlanId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type LogtoSkuResponse } from '@/cloud/types/router';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import SkuName from '@/components/SkuName';
import { skuQuotaItemOrder } from '@/consts/plan-quotas';
import {
  skuQuotaItemLimitedPhrasesMap,
  skuQuotaItemNotEligiblePhrasesMap,
} from '@/consts/quota-item-phrases';
import DynamicT from '@/ds-components/DynamicT';
import { type LogtoSkuQuota, type LogtoSkuQuotaEntries } from '@/types/skus';
import { sortBy } from '@/utils/sort';

import styles from './index.module.scss';

const excludedSkuQuotaKeys = new Set<keyof LogtoSkuQuota>([
  'auditLogsRetentionDays',
  'ticketSupportResponseTime',
]);

type SkuProps = {
  readonly targetSku: LogtoSkuResponse;
  readonly exceededSkuQuotaKeys: Array<keyof LogtoSkuQuota>;
  readonly isDowngrade?: boolean;
};

/**
 * Almost copy/paste from the implementation above, but with different types and constants to fit the use cases of new pricing model.
 * Old one will be deprecated soon.
 */
export function NotEligibleSwitchSkuModalContent({
  targetSku,
  exceededSkuQuotaKeys,
  isDowngrade = false,
}: SkuProps) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.subscription.not_eligible_modal',
  });

  const { id, quota } = targetSku;

  const orderedEntries = useMemo(() => {
    // eslint-disable-next-line no-restricted-syntax
    const entries = Object.entries(quota) as LogtoSkuQuotaEntries;
    return entries
      .filter(([quotaKey]) => exceededSkuQuotaKeys.includes(quotaKey))
      .slice()
      .sort(([preQuotaKey], [nextQuotaKey]) =>
        sortBy(skuQuotaItemOrder)(preQuotaKey, nextQuotaKey)
      );
  }, [quota, exceededSkuQuotaKeys]);

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Trans
          components={{
            name: <SkuName skuId={id} />,
          }}
        >
          {t(isDowngrade ? 'downgrade_description' : 'upgrade_description')}
        </Trans>
        {!isDowngrade && id === ReservedPlanId.Pro && t('upgrade_pro_tip')}
      </div>
      <ul className={styles.list}>
        {orderedEntries.map(([quotaKey, quotaValue]) => {
          if (
            excludedSkuQuotaKeys.has(quotaKey) ||
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
                        forKey={`subscription.quota_item.${skuQuotaItemLimitedPhrasesMap[quotaKey]}`}
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
                  forKey={`subscription.quota_item.${skuQuotaItemNotEligiblePhrasesMap[quotaKey]}`}
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
