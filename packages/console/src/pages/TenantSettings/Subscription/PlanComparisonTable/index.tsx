import { cond } from '@silverhand/essentials';
import { Fragment, useMemo } from 'react';

import PlanName from '@/components/PlanName';
import { enterprisePlanTableData, planTableGroupKeyMap } from '@/consts/plan-quotas';
import { type SubscriptionPlanTableGroupKey, type SubscriptionPlan } from '@/types/subscriptions';

import PlanQuotaGroupKeyLabel from './PlanQuotaGroupKeyLabel';
import PlanQuotaKeyLabel from './PlanQuotaKeyLabel';
import * as styles from './index.module.scss';
import { quotaValueRenderer } from './renderers';
import { constructPlanTableDataArray } from './utils';

type Props = {
  subscriptionPlans: SubscriptionPlan[];
};

function PlanComparisonTable({ subscriptionPlans }: Props) {
  const planTableDataArray = useMemo(
    () => [
      ...constructPlanTableDataArray(subscriptionPlans),
      // Note: enterprise plan table data is not included in the subscription plans, and it's only for display
      enterprisePlanTableData,
    ],
    [subscriptionPlans]
  );

  return (
    <div className={styles.container}>
      <table>
        <thead>
          <tr>
            <th />
            {planTableDataArray.map(({ name }) => (
              <th key={name}>
                <PlanName name={name} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(planTableGroupKeyMap).map(([groupKey, quotaKeys]) => (
            <Fragment key={groupKey}>
              <tr>
                <td className={styles.groupLabel}>
                  {/* eslint-disable-next-line no-restricted-syntax */}
                  <PlanQuotaGroupKeyLabel groupKey={groupKey as SubscriptionPlanTableGroupKey} />
                </td>
              </tr>
              {quotaKeys.map((quotaKey, index) => (
                <tr
                  key={`${groupKey}-${quotaKey}`}
                  className={cond(index % 2 === 0 && styles.colorRow)}
                >
                  <td className={styles.quotaKeyColumn}>
                    <PlanQuotaKeyLabel quotaKey={quotaKey} />
                  </td>
                  {planTableDataArray.map((tableData) => (
                    <td key={`${tableData.id}-${quotaKey}`}>
                      {quotaValueRenderer[quotaKey](tableData)}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlanComparisonTable;
