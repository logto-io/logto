import { cond, type Nullable } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlanTable } from '@/types/subscriptions';

const planQuotaKeyPhraseMap: {
  [key in keyof Required<SubscriptionPlanTable>]: Nullable<
    TFuncKey<'translation', 'admin_console.subscription.quota_table'>
  >;
} = {
  basePrice: 'quota.base_price',
  mauUnitPrice: 'quota.mau_unit_price',
  mauLimit: 'quota.mau_limit',
  /**
   * Token limit is required in the plan quota table but we don't display it as a row data.
   */
  tokenLimit: null,
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
  ssoEnabled: 'user_authn.sso',
  userManagementEnabled: 'user_management.user_management',
  rolesLimit: 'user_management.roles',
  machineToMachineRolesLimit: 'user_management.machine_to_machine_roles',
  scopesPerRoleLimit: 'user_management.scopes_per_role',
  hooksLimit: 'hooks.hooks',
  auditLogsRetentionDays: 'audit_logs.retention',
  communitySupportEnabled: 'support.community',
  /**
   * Todo @xiaoyijun [Pricing] Remove feature flag
   */
  ticketSupportResponseTime: isDevFeaturesEnabled
    ? 'support.email_ticket_support'
    : 'support.customer_ticket',
  /**
   * Todo @xiaoyijun [Pricing] Remove feature flag
   */
  organizationsEnabled: isDevFeaturesEnabled
    ? 'organizations.monthly_active_organization'
    : 'organizations.organizations',
  allowedUsersPerOrganization: 'organizations.allowed_users_per_org',
  invitationEnabled: 'organizations.invitation',
  orgRolesLimit: 'organizations.org_roles',
  orgPermissionsLimit: 'organizations.org_permissions',
  justInTimeProvisioningEnabled: 'organizations.just_in_time_provisioning',
  soc2ReportEnabled: 'support.soc2_report',
  hipaaOrBaaReportEnabled: 'support.hipaa_or_baa_report',
};

type Props = {
  quotaKey: keyof SubscriptionPlanTable;
};

function PlanQuotaKeyLabel({ quotaKey }: Props) {
  const phraseKey = planQuotaKeyPhraseMap[quotaKey];
  return cond(phraseKey && <DynamicT forKey={`subscription.quota_table.${phraseKey}`} />) ?? <>-</>;
}

export default PlanQuotaKeyLabel;
