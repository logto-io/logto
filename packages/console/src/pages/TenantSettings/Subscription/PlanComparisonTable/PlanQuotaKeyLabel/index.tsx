import { cond } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlanTable } from '@/types/subscriptions';

import TableDataWrapper from '../components/TableDataWrapper';

const planQuotaKeyPhraseMap: {
  [key in keyof Required<SubscriptionPlanTable>]: TFuncKey<
    'translation',
    'admin_console.subscription.quota_table'
  >;
} = {
  basePrice: 'quota.base_price',
  mauLimit: 'quota.mau_limit',
  tokenLimit: 'quota.included_tokens',
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
  ticketSupportResponseTime: 'support.email_ticket_support',
  organizationsEnabled: 'organizations.monthly_active_organization',
  allowedUsersPerOrganization: 'organizations.allowed_users_per_org',
  invitationEnabled: 'organizations.invitation',
  orgRolesLimit: 'organizations.org_roles',
  orgPermissionsLimit: 'organizations.org_permissions',
  justInTimeProvisioningEnabled: 'organizations.just_in_time_provisioning',
  soc2ReportEnabled: 'support.soc2_report',
  hipaaOrBaaReportEnabled: 'support.hipaa_or_baa_report',
};

const planQuotaTipPhraseMap: Partial<
  Record<
    keyof Required<SubscriptionPlanTable>,
    TFuncKey<'translation', 'admin_console.subscription.quota_table'>
  >
> = {
  mauLimit: 'mau_tip',
  tokenLimit: 'tokens_tip',
  organizationsEnabled: 'mao_tip',
};

type Props = {
  quotaKey: keyof SubscriptionPlanTable;
};

function PlanQuotaKeyLabel({ quotaKey }: Props) {
  const quotaTip = planQuotaTipPhraseMap[quotaKey];

  return (
    <TableDataWrapper
      isLeftAligned
      tip={cond(quotaTip && <DynamicT forKey={`subscription.quota_table.${quotaTip}`} />)}
    >
      <DynamicT forKey={`subscription.quota_table.${planQuotaKeyPhraseMap[quotaKey]}`} />
    </TableDataWrapper>
  );
}

export default PlanQuotaKeyLabel;
