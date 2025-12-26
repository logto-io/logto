import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type LogtoEnterpriseSubscriptionResponse } from '@/cloud/types/router';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { formatQuotaNumber } from '@/utils/number';

import styles from './index.module.scss';
import { formatTableData } from './utils';

type Props = {
  readonly data?: LogtoEnterpriseSubscriptionResponse;
  readonly isLoading?: boolean;
};

function SubscriptionPlanTable({ data, isLoading }: Props) {
  const tableData = useMemo(() => formatTableData(data), [data]);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Table
      hasBorder
      className={styles.table}
      isLoading={isLoading}
      rowGroups={[{ key: 'id', data: tableData }]}
      rowIndexKey="id"
      columns={[
        {
          title: t('enterprise_subscription.subscription.basic_plan_column_title.product'),
          dataIndex: 'title',
          render: ({ title }) => title,
        },
        {
          title: t('enterprise_subscription.subscription.basic_plan_column_title.usage'),
          dataIndex: 'usages',
          render: ({ usages, quota }) => {
            if (typeof usages === 'number') {
              if (typeof quota === 'number' && usages > quota) {
                return (
                  <span className={styles.inlineItem}>
                    {formatQuotaNumber(usages)}
                    <Tag className={styles.tag} type="property" status="alert">
                      <DynamicT forKey="enterprise_subscription.subscription.over_quota" />
                    </Tag>
                  </span>
                );
              }

              return formatQuotaNumber(usages);
            }

            return (
              <Tag className={styles.tag} type="state" status={usages ? 'success' : 'info'}>
                <DynamicT
                  forKey={`subscription.usage.${usages ? 'status_active' : 'status_inactive'}`}
                />
              </Tag>
            );
          },
        },
        {
          title: t('enterprise_subscription.subscription.basic_plan_column_title.quota'),
          dataIndex: 'quota',
          render: ({ quota }) => {
            if (typeof quota === 'number') {
              return formatQuotaNumber(quota);
            }

            if (quota === null) {
              return <DynamicT forKey="subscription.quota_table.unlimited" />;
            }

            if (quota) {
              return <DynamicT forKey="enterprise_subscription.subscription.included" />;
            }
          },
        },
      ]}
    />
  );
}

export default SubscriptionPlanTable;
