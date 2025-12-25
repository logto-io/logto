import { type Nullable } from '@silverhand/essentials';
import { t } from 'i18next';

import { type LogtoEnterpriseSubscriptionResponse } from '@/cloud/types/router';
import { titleKeyMap, type UsageKey, usageKeys } from '@/components/PlanUsage/utils';

type TableDataItem = {
  id: string;
  title: string;
  usages: boolean | number;
  quota: Nullable<boolean | number>;
};

const buildUsageKeyTitle = (key: UsageKey): string => {
  const title = titleKeyMap[key];

  return String(t(`admin_console.subscription.usage.${title}`));
};

const filterUndefined = <T>(item: T | undefined): item is T => item !== undefined;

export const formatTableData = (
  data: LogtoEnterpriseSubscriptionResponse | undefined
): TableDataItem[] => {
  if (!data) {
    return [];
  }

  const { usages, quota, regionNames, quotaScope } = data;

  const regionUsages: TableDataItem[] = regionNames.map((regionName) => ({
    id: regionName,
    title: String(
      t('admin_console.enterprise_subscription.subscription.private_region_title', {
        regionName,
      })
    ),
    usages: 1,
    quota: 1,
  }));

  // If the quota scope is dedicated, we only return the private instance usages.
  // As dedicated quota scope subscription does not have any shared usages.
  // All the quota and usages are allocated to the pay-as-you-go SKUs.
  if (quotaScope === 'dedicated') {
    return regionUsages;
  }

  // If usages or basicQuota is undefined, return the region usages only.
  if (!usages || !quota?.basicQuota) {
    return regionUsages;
  }

  const { basicQuota } = quota;

  const quotaUsageItems: TableDataItem[] = usageKeys
    // Only show the usage item when its quota is defined and not zero/false (included).
    .map<TableDataItem | undefined>((key) => {
      // We need to specially handle the RBAC enabled usage case
      // RBAC is considered enabled if both userRolesLimit and machineToMachineRolesLimit are null in the quota,
      // and if the usage for userRolesLimit is greater than 0 or the usage for machineToMachineRolesLimit is greater than 1.
      if (key === 'rbacEnabled') {
        const { userRolesLimit, machineToMachineRolesLimit } = basicQuota;
        const isRbacEnabledInQuota = userRolesLimit === null && machineToMachineRolesLimit === null;

        const isRbacEnabledInUsage =
          usages.userRolesLimit > 0 || usages.machineToMachineRolesLimit > 1;

        if (!isRbacEnabledInQuota) {
          return;
        }

        return {
          id: key,
          title: buildUsageKeyTitle(key),
          usages: isRbacEnabledInUsage,
          quota: isRbacEnabledInQuota,
        };
      }

      const quotaValue = basicQuota[key];

      if (typeof quotaValue === 'boolean' && !quotaValue) {
        return;
      }

      if (typeof quotaValue === 'number' && quotaValue === 0) {
        return;
      }

      const usageValue = usages[key];

      return {
        id: key,
        title: buildUsageKeyTitle(key),
        usages: usageValue,
        quota: quotaValue,
      };
    })
    .filter((item) => filterUndefined(item));

  return [...regionUsages, ...quotaUsageItems];
};
