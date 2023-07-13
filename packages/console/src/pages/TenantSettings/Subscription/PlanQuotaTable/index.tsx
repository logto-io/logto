import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';

import Success from '@/assets/icons/success.svg';
import PlanName from '@/components/PlanName';
import { enterprisePlanTableData, planTableGroupKeyMap } from '@/consts/subscriptions';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import { type RowGroup, type Column } from '@/ds-components/Table/types';
import {
  type SubscriptionPlanTableRow,
  type SubscriptionPlanTableGroupKey,
  type SubscriptionPlan,
} from '@/types/subscriptions';

import PlanQuotaGroupKeyLabel from './PlanQuotaGroupKeyLabel';
import PlanQuotaKeyLabel from './PlanQuotaKeyLabel';
import * as styles from './index.module.scss';
import { constructPlanTableDataArray } from './utils';

type Props = {
  subscriptionPlans: SubscriptionPlan[];
};

function PlanQuotaTable({ subscriptionPlans }: Props) {
  const quotaTableRowGroups: Array<RowGroup<SubscriptionPlanTableRow>> = useMemo(() => {
    const tableDataArray = [
      ...constructPlanTableDataArray(subscriptionPlans),
      // Note: enterprise plan table data is not included in the subscription plans, and it's only for display
      enterprisePlanTableData,
    ];

    return Object.entries(planTableGroupKeyMap).map(([groupKey, quotaKeys]) => {
      return {
        key: groupKey,
        // eslint-disable-next-line no-restricted-syntax
        label: <PlanQuotaGroupKeyLabel groupKey={groupKey as SubscriptionPlanTableGroupKey} />,
        labelClassName: styles.groupLabel,
        data: quotaKeys.map((key) => {
          const tableData = Object.fromEntries(
            tableDataArray.map(({ name, table }) => {
              return [name, table[key]];
            })
          );

          return {
            quotaKey: key,
            ...tableData,
          };
        }),
      };
    });
  }, [subscriptionPlans]);

  const quotaTableRowData = quotaTableRowGroups[0]?.data?.at(0);

  if (quotaTableRowData === undefined) {
    return null;
  }

  const planQuotaTableColumns = Object.keys(quotaTableRowData) satisfies Array<
    keyof SubscriptionPlanTableRow
  >;

  return (
    <div className={styles.container}>
      <Table
        isRowHoverEffectDisabled
        rowGroups={quotaTableRowGroups}
        rowIndexKey="quotaKey"
        rowClassName={(_, index) => conditional(index % 2 !== 0 && styles.colorRow)}
        className={styles.table}
        headerTableClassName={styles.headerTable}
        bodyTableWrapperClassName={styles.bodyTableWrapper}
        columns={
          planQuotaTableColumns.map((column) => {
            const columnTitle = conditional(column !== 'quotaKey' && column);

            return {
              title: conditional(columnTitle && <PlanName name={columnTitle} />),
              dataIndex: column,
              className: conditional(column === 'quotaKey' && styles.quotaKeyColumn),
              render: (row) => {
                const { quotaKey } = row;

                if (column === 'quotaKey') {
                  return <PlanQuotaKeyLabel quotaKey={quotaKey} />;
                }

                const quotaValue = row[column];

                if (quotaValue === undefined) {
                  return <DynamicT forKey="subscription.quota_table.contact" />;
                }

                if (quotaValue === null) {
                  return <DynamicT forKey="subscription.quota_table.unlimited" />;
                }

                // For base price
                if (typeof quotaValue === 'string') {
                  if (quotaKey === 'basePrice') {
                    return (
                      <DynamicT
                        forKey="subscription.quota_table.monthly_price"
                        interpolation={{ value: Number(quotaValue) / 100 }}
                      />
                    );
                  }

                  return quotaValue;
                }

                // For mau unit price
                if (Array.isArray(quotaValue)) {
                  return quotaValue.length === 0 ? (
                    '-'
                  ) : (
                    <div>
                      {quotaValue.map((value) => (
                        <div key={value}>
                          <DynamicT
                            forKey="subscription.quota_table.mau_price"
                            interpolation={{ value: Number(value) / 100 }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }

                if (typeof quotaValue === 'boolean') {
                  return quotaValue ? <Success /> : '-';
                }

                // Note: handle number type
                if (quotaValue === 0) {
                  return '-';
                }

                if (quotaKey === 'auditLogsRetentionDays') {
                  return (
                    <DynamicT
                      forKey="subscription.quota_table.days"
                      interpolation={{ count: quotaValue }}
                    />
                  );
                }

                if (quotaKey === 'ticketSupportResponseTime') {
                  return (
                    <div className={styles.ticketSupport}>
                      <Success />
                      <span>{`(${quotaValue}h)`}</span>
                    </div>
                  );
                }

                return quotaValue.toLocaleString();
              },
            };
          }) satisfies Array<Column<SubscriptionPlanTableRow>>
        }
      />
      <div className={styles.footnote}>
        <DynamicT forKey="subscription.quota_table.mau_unit_price_footnote" />
      </div>
    </div>
  );
}

export default PlanQuotaTable;
