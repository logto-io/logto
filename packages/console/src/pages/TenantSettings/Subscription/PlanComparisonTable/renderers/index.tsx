import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { t } from 'i18next';
import { type ReactNode } from 'react';

import { type SubscriptionPlanTable, type SubscriptionPlanTableData } from '@/types/subscriptions';

import BasePrice from './BasePrice';
import GenericFeatureFlag from './GenericFeatureFlag';
import GenericQuotaLimit from './GenericQuotaLimit';

export const quotaValueRenderer: Record<
  keyof SubscriptionPlanTable,
  (planTableData: SubscriptionPlanTableData) => ReactNode
> = {
  // Base
  basePrice: ({ table: { basePrice } }) => <BasePrice value={basePrice} />,
  tokenLimit: () => <div />, // Dummy: We don't display token limit as an item in the plan comparison table.
  mauLimit: ({ id, table: { tokenLimit, mauLimit } }) => (
    <GenericQuotaLimit
      quota={mauLimit}
      tipPhraseKey={cond(
        tokenLimit && (id === ReservedPlanId.Free ? 'free_token_limit_tip' : 'paid_token_limit_tip')
      )}
      tipInterpolation={cond(typeof tokenLimit === 'number' && { value: tokenLimit / 1_000_000 })}
    />
  ),
  // Applications
  applicationsLimit: ({ table: { applicationsLimit } }) => (
    <GenericQuotaLimit quota={applicationsLimit} />
  ),
  machineToMachineLimit: ({ id, table: { machineToMachineLimit } }) => (
    <GenericQuotaLimit
      quota={machineToMachineLimit}
      tipPhraseKey={cond(id !== ReservedPlanId.Free && 'paid_quota_limit_tip')}
    />
  ),
  // Resources
  resourcesLimit: ({ id, table: { resourcesLimit } }) => (
    <GenericQuotaLimit
      quota={resourcesLimit}
      tipPhraseKey={cond(id !== ReservedPlanId.Free && 'paid_quota_limit_tip')}
    />
  ),
  scopesPerResourceLimit: ({ table: { scopesPerResourceLimit } }) => (
    <GenericQuotaLimit quota={scopesPerResourceLimit} />
  ),
  // Branding
  customDomainEnabled: ({ table: { customDomainEnabled } }) => (
    <GenericFeatureFlag isEnabled={customDomainEnabled} />
  ),
  customCssEnabled: ({ table: { customCssEnabled } }) => (
    <GenericFeatureFlag isEnabled={customCssEnabled} />
  ),
  appLogoAndFaviconEnabled: ({ table: { appLogoAndFaviconEnabled } }) => (
    <GenericFeatureFlag isEnabled={appLogoAndFaviconEnabled} />
  ),
  darkModeEnabled: ({ table: { darkModeEnabled } }) => (
    <GenericFeatureFlag isEnabled={darkModeEnabled} />
  ),
  i18nEnabled: ({ table: { i18nEnabled } }) => <GenericFeatureFlag isEnabled={i18nEnabled} />,
  // UserAuthentication
  mfaEnabled: ({ table: { mfaEnabled } }) => (
    <GenericFeatureFlag
      isBeta
      isEnabled={mfaEnabled}
      paymentType="add-on"
      tipPhraseKey={cond(mfaEnabled && 'beta_feature_tip')}
    />
  ),
  omniSignInEnabled: ({ table: { omniSignInEnabled } }) => (
    <GenericFeatureFlag isEnabled={omniSignInEnabled} />
  ),
  passwordSignInEnabled: ({ table: { passwordSignInEnabled } }) => (
    <GenericFeatureFlag isEnabled={passwordSignInEnabled} />
  ),
  passwordlessSignInEnabled: ({ table: { passwordlessSignInEnabled } }) => (
    <GenericFeatureFlag isEnabled={passwordlessSignInEnabled} />
  ),
  emailConnectorsEnabled: ({ table: { emailConnectorsEnabled } }) => (
    <GenericFeatureFlag isEnabled={emailConnectorsEnabled} />
  ),
  smsConnectorsEnabled: ({ table: { smsConnectorsEnabled } }) => (
    <GenericFeatureFlag isEnabled={smsConnectorsEnabled} />
  ),
  socialConnectorsLimit: ({ table: { socialConnectorsLimit } }) => (
    <GenericQuotaLimit quota={socialConnectorsLimit} />
  ),
  standardConnectorsLimit: ({ table: { standardConnectorsLimit } }) => (
    <GenericQuotaLimit quota={standardConnectorsLimit} />
  ),
  ssoEnabled: ({ table: { ssoEnabled } }) => (
    <GenericFeatureFlag
      isBeta
      isEnabled={ssoEnabled}
      paymentType="add-on"
      tipPhraseKey={cond(ssoEnabled && 'beta_feature_tip')}
    />
  ),
  // Roles
  userManagementEnabled: ({ table: { userManagementEnabled } }) => (
    <GenericFeatureFlag isEnabled={userManagementEnabled} />
  ),
  rolesLimit: ({ table: { rolesLimit } }) => <GenericQuotaLimit quota={rolesLimit} />,
  machineToMachineRolesLimit: ({ table: { machineToMachineRolesLimit } }) => (
    <GenericQuotaLimit quota={machineToMachineRolesLimit} />
  ),
  scopesPerRoleLimit: ({ table: { scopesPerRoleLimit } }) => (
    <GenericQuotaLimit quota={scopesPerRoleLimit} />
  ),
  // Organizations
  organizationsEnabled: ({ table: { organizationsEnabled } }) => (
    <GenericFeatureFlag
      isBeta
      isEnabled={organizationsEnabled}
      paymentType="usage"
      tipPhraseKey={cond(organizationsEnabled && 'usage_based_beta_feature_tip')}
    />
  ),
  allowedUsersPerOrganization: ({ table: { allowedUsersPerOrganization } }) => (
    <GenericQuotaLimit quota={allowedUsersPerOrganization} />
  ),
  invitationEnabled: ({ table: { invitationEnabled } }) => (
    <GenericFeatureFlag isEnabled={invitationEnabled} />
  ),
  orgRolesLimit: ({ table: { orgRolesLimit } }) => <GenericQuotaLimit quota={orgRolesLimit} />,
  orgPermissionsLimit: ({ table: { orgPermissionsLimit } }) => (
    <GenericQuotaLimit quota={orgPermissionsLimit} />
  ),
  justInTimeProvisioningEnabled: ({ table: { justInTimeProvisioningEnabled } }) => (
    <GenericFeatureFlag isEnabled={justInTimeProvisioningEnabled} />
  ),
  // Audit logs
  auditLogsRetentionDays: ({ table: { auditLogsRetentionDays } }) => (
    <GenericQuotaLimit
      quota={auditLogsRetentionDays}
      formatter={(quota) => t('admin_console.subscription.quota_table.days', { count: quota })}
    />
  ),
  // Hooks
  hooksLimit: ({ table: { hooksLimit } }) => <GenericQuotaLimit quota={hooksLimit} />,
  // Support
  communitySupportEnabled: ({ table: { communitySupportEnabled } }) => (
    <GenericFeatureFlag isEnabled={communitySupportEnabled} />
  ),
  ticketSupportResponseTime: ({ table: { ticketSupportResponseTime } }) => (
    <GenericQuotaLimit
      hasCheckmark
      quota={ticketSupportResponseTime}
      formatter={(quota) => `(${quota}h)`}
    />
  ),
  soc2ReportEnabled: ({ table: { soc2ReportEnabled } }) => (
    <GenericFeatureFlag isEnabled={soc2ReportEnabled} />
  ),
  hipaaOrBaaReportEnabled: ({ table: { hipaaOrBaaReportEnabled } }) => (
    <GenericFeatureFlag isEnabled={hipaaOrBaaReportEnabled} />
  ),
};
