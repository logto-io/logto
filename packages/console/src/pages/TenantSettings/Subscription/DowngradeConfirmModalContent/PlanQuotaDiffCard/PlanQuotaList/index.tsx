import classNames from 'classnames';

import { type LogtoSkuQuotaEntries } from '@/types/skus';

import { DiffSkuQuotaItem } from './DiffQuotaItem';
import styles from './index.module.scss';

type Props = {
  readonly skuQuotaEntries: LogtoSkuQuotaEntries;
  readonly isDowngradeTargetPlan: boolean;
  readonly className?: string;
};

function PlanQuotaList({ skuQuotaEntries, isDowngradeTargetPlan, className }: Props) {
  return (
    <ul className={classNames(styles.planQuotaList, className)}>
      {skuQuotaEntries.map(([quotaKey, quotaValue]) => (
        <DiffSkuQuotaItem
          key={quotaKey}
          quotaKey={quotaKey}
          quotaValue={quotaValue}
          hasStatusIcon={isDowngradeTargetPlan}
        />
      ))}
    </ul>
  );
}

export default PlanQuotaList;
