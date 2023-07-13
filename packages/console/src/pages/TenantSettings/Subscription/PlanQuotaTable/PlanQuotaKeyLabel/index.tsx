import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlanTable } from '@/types/subscriptions';

const planQuotaKeyPhraseMap: {
  [key in keyof Required<SubscriptionPlanTable>]: TFuncKey<
    'translation',
    'admin_console.subscription.quota_table'
  >;
} = {
  mauLimit: 'quota.mau_limit',
  applicationsLimit: 'application.total',
  machineToMachineLimit: 'application.m2m',
  resourcesLimit: 'resource.resource_count',
  scopesPerResourceLimit: 'resource.scopes_per_resource',
  customDomainEnabled: 'branding.custom_domain',
  omniSignInEnabled: 'user_authn.omni_sign_in',
  builtInEmailConnectorEnabled: 'user_authn.built_in_email_connector',
  socialConnectorsLimit: 'user_authn.social_connectors',
  standardConnectorsLimit: 'user_authn.standard_connectors',
  rolesLimit: 'roles.roles',
  scopesPerRoleLimit: 'roles.scopes_per_role',
  hooksLimit: 'hooks.amount',
  auditLogsRetentionDays: 'audit_logs.retention',
  basePrice: 'quota.base_price',
  mauUnitPrice: 'quota.mau_unit_price',
  communitySupportEnabled: 'support.community',
  ticketSupportResponseTime: 'support.customer_ticket',
};

type Props = {
  quotaKey: keyof SubscriptionPlanTable;
};

function PlanQuotaKeyLabel({ quotaKey }: Props) {
  return <DynamicT forKey={`subscription.quota_table.${planQuotaKeyPhraseMap[quotaKey]}`} />;
}

export default PlanQuotaKeyLabel;
