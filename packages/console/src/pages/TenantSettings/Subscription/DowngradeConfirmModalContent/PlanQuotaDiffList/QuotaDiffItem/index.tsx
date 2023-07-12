import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import DescendArrow from '@/assets/icons/descend-arrow.svg';
import Failed from '@/assets/icons/failed.svg';
import {
  quotaItemUnlimitedPhrasesMap,
  quotaItemPhrasesMap,
  quotaItemLimitedPhrasesMap,
} from '@/pages/TenantSettings/Subscription/quota-item-phrases';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import * as styles from './index.module.scss';

type Props = {
  hasIcon?: boolean;
  quotaKey: keyof SubscriptionPlanQuota;
  quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota];
};

function QuotaDiffItem({ hasIcon = false, quotaKey, quotaValue }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription.quota_item' });
  const isUnlimited = quotaValue === null;
  const isNotCapable = quotaValue === 0 || quotaValue === false;
  const isLimited = Boolean(quotaValue);

  const Icon = isNotCapable ? Failed : DescendArrow;

  return (
    <li className={classNames(styles.item, hasIcon && styles.withChangeState)}>
      <span
        className={classNames(styles.itemContent, hasIcon && isNotCapable && styles.notCapable)}
      >
        {hasIcon && <Icon className={styles.icon} />}
        <span>
          {isUnlimited && <>{t(quotaItemUnlimitedPhrasesMap[quotaKey])}</>}
          {isNotCapable && <>{t(quotaItemPhrasesMap[quotaKey])}</>}
          {isLimited && (
            <>
              {t(
                quotaItemLimitedPhrasesMap[quotaKey],
                conditional(typeof quotaValue === 'number' && { count: quotaValue }) ?? {}
              )}
            </>
          )}
        </span>
      </span>
    </li>
  );
}

export default QuotaDiffItem;
