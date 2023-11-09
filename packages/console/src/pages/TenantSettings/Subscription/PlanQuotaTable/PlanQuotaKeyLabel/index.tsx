import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlanTable } from '@/types/subscriptions';

const planQuotaKeyPhraseMap: {
  [key in keyof Required<SubscriptionPlanTable>]: TFuncKey<
    'translation',
    'admin_console.subscription.quota_table'
  >;
} = {
  basePrice: 'quota.base_price',
  mauUnitPrice: 'quota.mau_unit_price',
  mauLimit: 'quota.mau_limit',
  applicationsLimit: 'application.total',
  machineToMachineLimit: 'application.m2m',
  resourcesLimit: 'resource.resource_count',
  scopesPerResourceLimit: 'resource.scopes_per_resource',
  customDomainEnabled: 'branding.custom_domain',
  customCssEnabled: 'branding.custom_css',
  appLogoAndFaviconEnabled: 'branding.app_logo_and_favicon',
  darkModeEnabled: 'branding.dark_mode',
  i18nEnabled: 'branding.i18n',
  omniSignInEnabled: 'user_authn.omni_sign_in',
  passwordSignInEnabled: 'user_authn.password',
  passwordlessSignInEnabled: 'user_authn.passwordless',
  emailConnectorsEnabled: 'user_authn.email_connector',
  smsConnectorsEnabled: 'user_authn.sms_connector',
  socialConnectorsLimit: 'user_authn.social_connectors',
  standardConnectorsLimit: 'user_authn.standard_connectors',
  mfaEnabled: 'user_authn.mfa',
  userManagementEnabled: 'user_management.user_management',
  rolesLimit: 'user_management.roles',
  scopesPerRoleLimit: 'user_management.scopes_per_role',
  hooksLimit: 'hooks.hooks',
  auditLogsRetentionDays: 'audit_logs.retention',
  communitySupportEnabled: 'support.community',
  ticketSupportResponseTime: 'support.customer_ticket',
  organizationEnabled: 'organization.organization',
};

type Props = {
  quotaKey: keyof SubscriptionPlanTable;
};

function PlanQuotaKeyLabel({ quotaKey }: Props) {
  return <DynamicT forKey={`subscription.quota_table.${planQuotaKeyPhraseMap[quotaKey]}`} />;
}

export default PlanQuotaKeyLabel;
