import { ReservedPlanId } from '@logto/schemas';
import { useMemo } from 'react';

import PlanQuotaList from '@/components/PlanQuotaList';
import { comingSoonQuotaKeys } from '@/consts/plan-quotas';
import { quotaItemAddOnPhrasesMap } from '@/consts/quota-item-phrases';
import {
  type SubscriptionPlanQuotaEntries,
  type SubscriptionPlan,
  type SubscriptionPlanQuota,
} from '@/types/subscriptions';

import FeaturedQuotaItem from './FeaturedQuotaItem';
import * as styles from './index.module.scss';

const featuredQuotaKeys = new Set<keyof SubscriptionPlanQuota>([
  'mauLimit',
  'machineToMachineLimit',
  'thirdPartyApplicationsLimit',
  'rolesLimit',
  'scopesPerRoleLimit',
  'mfaEnabled',
  'ssoEnabled',
  'organizationsEnabled',
  'auditLogsRetentionDays',
]);

type Props = {
  plan: SubscriptionPlan;
};

function FeaturedPlanQuotaList({ plan }: Props) {
  const { id: planId, quota } = plan;

  const featuredEntries = useMemo(
    () =>
      // eslint-disable-next-line no-restricted-syntax
      (Object.entries(quota) as SubscriptionPlanQuotaEntries).filter(([key]) =>
        featuredQuotaKeys.has(key)
      ),
    [quota]
  );

  return (
    <PlanQuotaList
      className={styles.featuredQuotaList}
      entries={featuredEntries}
      itemRenderer={(quotaKey, quotaValue) => (
        <FeaturedQuotaItem
          key={quotaKey}
          quotaKey={quotaKey}
          quotaValue={quotaValue}
          isAddOnQuota={
            planId !== ReservedPlanId.Free && Boolean(quotaItemAddOnPhrasesMap[quotaKey])
          }
          isComingSoonTagVisible={comingSoonQuotaKeys.includes(quotaKey)}
        />
      )}
    />
  );
}

export default FeaturedPlanQuotaList;
