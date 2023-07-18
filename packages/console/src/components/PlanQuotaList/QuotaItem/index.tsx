import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import DescendArrow from '@/assets/icons/descend-arrow.svg';
import Failed from '@/assets/icons/failed.svg';
import Success from '@/assets/icons/success.svg';
import {
  quotaItemUnlimitedPhrasesMap,
  quotaItemPhrasesMap,
  quotaItemLimitedPhrasesMap,
} from '@/consts/quota-item-phrases';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import * as styles from './index.module.scss';

type Props = {
  hasIcon?: boolean;
  quotaKey: keyof SubscriptionPlanQuota;
  quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota];
  isDiffItem?: boolean;
};

function QuotaItem({ hasIcon, quotaKey, quotaValue, isDiffItem }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription.quota_item' });
  const isUnlimited = quotaValue === null;
  const isNotCapable = quotaValue === 0 || quotaValue === false;
  const isLimited = Boolean(quotaValue);

  const Icon = isNotCapable ? Failed : isDiffItem ? DescendArrow : Success;

  return (
    <li className={classNames(styles.item, hasIcon && styles.withIcon)}>
      <span className={styles.itemContent}>
        {hasIcon && (
          <Icon
            className={classNames(styles.icon, isNotCapable ? styles.notCapable : styles.capable)}
          />
        )}
        <span className={classNames(isDiffItem && isNotCapable && styles.lineThrough)}>
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

export default QuotaItem;
