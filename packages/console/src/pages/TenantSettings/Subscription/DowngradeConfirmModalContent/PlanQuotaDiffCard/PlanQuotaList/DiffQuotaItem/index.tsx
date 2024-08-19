import { cond } from '@silverhand/essentials';
import classNames from 'classnames';

import DescendArrow from '@/assets/icons/descend-arrow.svg?react';
import Failed from '@/assets/icons/failed.svg?react';
import { type LogtoSkuQuota } from '@/types/skus';

import SkuQuotaItemPhrase from './SkuQuotaItemPhrase';
import styles from './index.module.scss';

type DiffSkuQuotaItemProps = {
  readonly quotaKey: keyof LogtoSkuQuota;
  readonly quotaValue: LogtoSkuQuota[keyof LogtoSkuQuota];
  readonly hasStatusIcon?: boolean;
};

/**
 * Almost copy/paste from the implementation above, but with different types and constants to fit the use cases of new pricing model.
 * Old one will be deprecated soon.
 */
export function DiffSkuQuotaItem({ quotaKey, quotaValue, hasStatusIcon }: DiffSkuQuotaItemProps) {
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
          <SkuQuotaItemPhrase skuQuotaKey={quotaKey} skuQuotaValue={quotaValue} />
        </span>
      </span>
    </li>
  );
}
