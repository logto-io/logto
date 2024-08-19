import { useMemo } from 'react';
import { Trans } from 'react-i18next';

import SkuName from '@/components/SkuName';
import { skuQuotaItemOrder } from '@/consts/plan-quotas';
import DynamicT from '@/ds-components/DynamicT';
import { type LogtoSkuQuota, type LogtoSkuQuotaEntries } from '@/types/skus';
import { sortBy } from '@/utils/sort';

import PlanQuotaList from './PlanQuotaList';
import styles from './index.module.scss';

type Props = {
  readonly skuId: string;
  readonly skuQuotaDiff: Partial<LogtoSkuQuota>;
  readonly isDowngradeTargetPlan?: boolean;
};

function PlanQuotaDiffCard({ skuId, skuQuotaDiff, isDowngradeTargetPlan = false }: Props) {
  // eslint-disable-next-line no-restricted-syntax
  const sortedSkuQuotaEntries = useMemo(
    () =>
      Object.entries(skuQuotaDiff)
        .slice()
        .sort(([preQuotaKey], [nextQuotaKey]) =>
          sortBy(skuQuotaItemOrder)(preQuotaKey, nextQuotaKey)
        ),
    [skuQuotaDiff]
  ) as LogtoSkuQuotaEntries;

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Trans
          components={{
            name: <SkuName skuId={skuId} />,
          }}
        >
          <DynamicT
            forKey={`subscription.downgrade_modal.${isDowngradeTargetPlan ? 'after' : 'before'}`}
          />
        </Trans>
      </div>
      <PlanQuotaList
        skuQuotaEntries={sortedSkuQuotaEntries}
        isDowngradeTargetPlan={isDowngradeTargetPlan}
      />
    </div>
  );
}

export default PlanQuotaDiffCard;
