import { type TFuncKey } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type LogtoEnterpriseSubscriptionResponse } from '@/cloud/types/router';
import {
  usageKeys,
  titleKeyMap,
  usageKeyPriceMap,
  type UsageKey,
  featureEnablementUsageKeys,
  CustomUsageKey,
} from '@/components/PlanUsage/utils';
import CardTitle from '@/ds-components/CardTitle';
import Table from '@/ds-components/Table';
import { LogtoSkuType } from '@/types/skus';

import styles from './index.module.scss';

type Props = {
  readonly skuItems: Exclude<
    LogtoEnterpriseSubscriptionResponse['subscriptionSkuItems'],
    undefined
  >;
  readonly quotaScope: LogtoEnterpriseSubscriptionResponse['quotaScope'];
};

type AddOnSkuTableItem = {
  id: string;
  usageKey: UsageKey;
  title: TFuncKey<'translation', 'admin_console.subscription.usage'>;
  unitPrice: number;
  count: number;
  totalPrice: number;
};

const findUsageKeyByAddOnItem = (
  quota: Props['skuItems'][number]['quota']
): UsageKey | undefined => {
  // Exclusively handle RBAC enabled add-on, as we have two quota fields for it
  if (quota.userRolesLimit !== undefined && quota.machineToMachineRolesLimit !== undefined) {
    return CustomUsageKey.RbacEnabled;
  }

  // Find the first matching usage key in the quota object.
  // Since for the rest of add-on items, there should be only one quota field defined,
  // so the first matched key is the only key.
  const usageKeyInQuota = Object.keys(quota).find((key): key is UsageKey =>
    // eslint-disable-next-line no-restricted-syntax
    usageKeys.includes(key as UsageKey)
  );

  return usageKeyInQuota;
};

const formatAddOnSkuTableItems = (addOnSkuItems: Props['skuItems']) => {
  return addOnSkuItems
    .map(({ quota, logtoSkuId, count }) => {
      const supportedAddOnUsageKey = findUsageKeyByAddOnItem(quota);

      // Temporarily filter out unsupported add-on items
      if (!supportedAddOnUsageKey) {
        return;
      }

      // TODO: Should replace, read the unit price from SKU item once the backend supports it
      const unitPrice = usageKeyPriceMap[supportedAddOnUsageKey];

      return {
        id: logtoSkuId,
        title: titleKeyMap[supportedAddOnUsageKey],
        usageKey: supportedAddOnUsageKey,
        unitPrice,
        count,
        totalPrice: unitPrice * count,
      };
    })
    .filter((item): item is AddOnSkuTableItem => item !== undefined);
};

function AddOnTable({ skuItems, quotaScope }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const addOnSkuItems = skuItems.filter((item) => item.type === LogtoSkuType.AddOn);

  const addOnSkuTableItems = useMemo(
    () => formatAddOnSkuTableItems(addOnSkuItems),
    [addOnSkuItems]
  );

  if (addOnSkuTableItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.section}>
      <CardTitle title="enterprise_subscription.subscription.add_on_title" />
      <div className={styles.description}>
        {t('enterprise_subscription.subscription.add_on_description')}
      </div>
      <Table
        hasBorder
        className={styles.table}
        rowGroups={[{ key: 'id', data: addOnSkuTableItems }]}
        rowIndexKey="id"
        columns={[
          {
            title: t('enterprise_subscription.subscription.add_on_column_title.product'),
            dataIndex: 'title',
            render: ({ title }) => String(t(`subscription.usage.${title}`)),
          },
          {
            title: t('enterprise_subscription.subscription.add_on_column_title.unit_price'),
            dataIndex: 'unitPrice',
            render: ({ unitPrice }) =>
              t('enterprise_subscription.subscription.add_on_sku_price', { price: unitPrice }),
          },
          {
            title: t('enterprise_subscription.subscription.add_on_column_title.quantity'),
            dataIndex: 'count',
            render: ({ count, usageKey }) => {
              if (quotaScope === 'shared' && featureEnablementUsageKeys.includes(usageKey)) {
                return t('enterprise_subscription.subscription.shared_cross_tenants');
              }

              return count;
            },
          },
          {
            title: t('enterprise_subscription.subscription.add_on_column_title.total_price'),
            dataIndex: 'totalPrice',
            render: ({ totalPrice }) =>
              t('enterprise_subscription.subscription.add_on_sku_price', { price: totalPrice }),
          },
        ]}
      />
    </div>
  );
}

export default AddOnTable;
