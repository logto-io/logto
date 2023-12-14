import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';
import { SubscriptionPlanTableGroupKey } from '@/types/subscriptions';

const planQuotaGroupKeyPhraseMap: {
  [key in SubscriptionPlanTableGroupKey]: TFuncKey<
    'translation',
    'admin_console.subscription.quota_table'
  >;
} = {
  [SubscriptionPlanTableGroupKey.base]: 'quota.title',
  [SubscriptionPlanTableGroupKey.applications]: 'application.title',
  [SubscriptionPlanTableGroupKey.resources]: 'resource.title',
  [SubscriptionPlanTableGroupKey.branding]: 'branding.title',
  [SubscriptionPlanTableGroupKey.userAuthentication]: 'user_authn.title',
  [SubscriptionPlanTableGroupKey.roles]: 'user_management.title',
  [SubscriptionPlanTableGroupKey.hooks]: 'hooks.title',
  [SubscriptionPlanTableGroupKey.organizations]: 'organizations.title',
  [SubscriptionPlanTableGroupKey.auditLogs]: 'audit_logs.title',
  [SubscriptionPlanTableGroupKey.support]: 'support.title',
};

type Props = {
  groupKey: SubscriptionPlanTableGroupKey;
};

function PlanQuotaGroupKeyLabel({ groupKey }: Props) {
  return <DynamicT forKey={`subscription.quota_table.${planQuotaGroupKeyPhraseMap[groupKey]}`} />;
}

export default PlanQuotaGroupKeyLabel;
