import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { t } from 'i18next';
import { type ReactNode } from 'react';

import { isDevFeaturesEnabled } from '@/consts/env';
import { type SubscriptionPlanTable, type SubscriptionPlanTableData } from '@/types/subscriptions';

import BasePrice from './BasePrice';
import GenericFeatureFlag from './GenericFeatureFlag';
import GenericQuotaLimit from './GenericQuotaLimit';
import MauUnitPrices from './MauUnitPrices';

export const quotaValueRenderer: Record<
  keyof SubscriptionPlanTable,
  (planTableData: SubscriptionPlanTableData) => ReactNode
> = {
  // Base
  basePrice: ({ table: { basePrice } }) => <BasePrice value={basePrice} />,
  mauUnitPrice: ({ table: { mauUnitPrice } }) => <MauUnitPrices prices={mauUnitPrice} />,
  tokenLimit: () => <div />, // Dummy: We don't display token limit as an item in the plan comparison table.
  mauLimit: ({ id, table: { tokenLimit, mauLimit } }) => (
    <GenericQuotaLimit
      quota={mauLimit}
      tipPhraseKey={cond(
        // Todo @xiaoyijun [Pricing] Remove feature flag
        isDevFeaturesEnabled &&
          tokenLimit &&
          (id === ReservedPlanId.Free ? 'free_token_limit_tip' : 'paid_token_limit_tip')
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
      tipPhraseKey={cond(
        // Todo @xiaoyijun [Pricing] Remove feature flag
        isDevFeaturesEnabled && id !== ReservedPlanId.Free && 'paid_quota_limit_tip'
      )}
    />
  ),
  // Resources
  resourcesLimit: ({ id, table: { resourcesLimit } }) => (
    <GenericQuotaLimit
      quota={resourcesLimit}
      tipPhraseKey={cond(
        // Todo @xiaoyijun [Pricing] Remove feature flag
        isDevFeaturesEnabled && id !== ReservedPlanId.Free && 'paid_quota_limit_tip'
      )}
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
      isEnabled={mfaEnabled}
      // Todo @xiaoyijun [Pricing] Remove feature flag
      isBeta={isDevFeaturesEnabled}
      // Todo @xiaoyijun [Pricing] Remove feature flag
      tipPhraseKey={cond(isDevFeaturesEnabled && mfaEnabled && 'beta_feature_tip')}
      paymentType="add-on"
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
      isEnabled={ssoEnabled}
      // Todo @xiaoyijun [Pricing] Remove feature flag
      isBeta={isDevFeaturesEnabled}
      // Todo @xiaoyijun [Pricing] Remove feature flag
      tipPhraseKey={cond(isDevFeaturesEnabled && ssoEnabled && 'beta_feature_tip')}
      paymentType="add-on"
    />
  ),
  // Roles
  userManagementEnabled: ({ table: { userManagementEnabled } }) => (
    <GenericFeatureFlag isEnabled={userManagementEnabled} />
  ),
  rolesLimit: ({ table: { rolesLimit } }) => <GenericQuotaLimit quota={rolesLimit} />,
  scopesPerRoleLimit: ({ table: { scopesPerRoleLimit } }) => (
    <GenericQuotaLimit quota={scopesPerRoleLimit} />
  ),
  // Organizations
  organizationsEnabled: ({ table: { organizationsEnabled } }) => (
    <GenericFeatureFlag
      isEnabled={organizationsEnabled}
      // Todo @xiaoyijun [Pricing] Remove feature flag
      isBeta={isDevFeaturesEnabled}
      // Todo @xiaoyijun [Pricing] Remove feature flag
      tipPhraseKey={cond(
        isDevFeaturesEnabled && organizationsEnabled && 'usage_based_beta_feature_tip'
      )}
      paymentType="usage"
    />
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
};
