import { cond } from '@silverhand/essentials';
import classNames from 'classnames';

import DescendArrow from '@/assets/icons/descend-arrow.svg';
import Failed from '@/assets/icons/failed.svg';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import QuotaItemPhrase from './QuotaItemPhrase';
import * as styles from './index.module.scss';

type Props = {
  readonly quotaKey: keyof SubscriptionPlanQuota;
  readonly quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota];
  readonly hasStatusIcon?: boolean;
};

function DiffQuotaItem({ quotaKey, quotaValue, hasStatusIcon }: Props) {
  const isNotCapable = quotaValue === 0 || quotaValue === false;
  const DowngradeStatusIcon = isNotCapable ? Failed : DescendArrow;

  return (
    <li className={classNames(styles.quotaListItem, hasStatusIcon && styles.withIcon)}>
      {/**
       * Add a `span` as a wrapper to apply the flex layout to the content.
       * If we apply the flex layout to the `li` directly, the `li` circle bullet will disappear.
       */}
      <span className={styles.content}>
        {cond(
          hasStatusIcon && (
            <DowngradeStatusIcon
              className={classNames(styles.icon, isNotCapable && styles.notCapable)}
            />
          )
        )}
        <span className={cond(isNotCapable && styles.lineThrough)}>
          <QuotaItemPhrase quotaKey={quotaKey} quotaValue={quotaValue} />
        </span>
      </span>
    </li>
  );
}

export default DiffQuotaItem;
