import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { t } from 'i18next';
import { type ReactNode } from 'react';

import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlanTable, type SubscriptionPlanTableData } from '@/types/subscriptions';

import BasePrice from './BasePrice';
import GenericFeatureFlag from './GenericFeatureFlag';
import GenericQuotaLimit from './GenericQuotaLimit';

const m2mAppUnitPrice = 8;
const resourceUnitPrice = 3;
const ssoUnitPrice = 48;
const mfaPrice = 48;
const maoDisplayLimit = 100;
const maoUnitPrice = 0.64;

export const quotaValueRenderer: Record<
  keyof SubscriptionPlanTable,
  (planTableData: SubscriptionPlanTableData) => ReactNode
> = {
  // Base
  basePrice: ({ table: { basePrice } }) => <BasePrice value={basePrice} />,
  mauLimit: ({ table: { mauLimit } }) => <GenericQuotaLimit quota={mauLimit} />,
  tokenLimit: ({ id, table: { tokenLimit } }) => (
    <GenericQuotaLimit
      quota={tokenLimit}
      tipPhraseKey={cond(tokenLimit && id !== ReservedPlanId.Free && 'paid_token_limit_tip')}
      formatter={(quota) => {
        return quota >= 1_000_000 ? (
          <DynamicT
            forKey="subscription.quota_table.million"
            interpolation={{ value: quota / 1_000_000 }}
          />
        ) : (
          quota.toLocaleString()
        );
      }}
    />
  ),
  // Applications
  applicationsLimit: ({ table: { applicationsLimit } }) => (
    <GenericQuotaLimit quota={applicationsLimit} />
  ),
  machineToMachineLimit: ({ id, table: { machineToMachineLimit } }) => {
    const isPaidPlan = id === ReservedPlanId.Hobby;

    return (
      <GenericQuotaLimit
        quota={machineToMachineLimit}
        tipPhraseKey={cond(isPaidPlan && 'paid_quota_limit_tip')}
        extraInfo={cond(
          isPaidPlan && (
            <DynamicT
              forKey="subscription.quota_table.extra_quota_price"
              interpolation={{ value: m2mAppUnitPrice }}
            />
          )
        )}
        formatter={cond(
          isPaidPlan &&
            ((quota) => (
              <DynamicT
                forKey="subscription.quota_table.included"
                interpolation={{ value: quota }}
              />
            ))
        )}
      />
    );
  },
  // Resources
  resourcesLimit: ({ id, table: { resourcesLimit } }) => {
    const isPaidPlan = id === ReservedPlanId.Hobby;
    return (
      <GenericQuotaLimit
        quota={resourcesLimit}
        tipPhraseKey={cond(isPaidPlan && 'paid_quota_limit_tip')}
        extraInfo={cond(
          isPaidPlan && (
            <DynamicT
              forKey="subscription.quota_table.extra_quota_price"
              interpolation={{ value: resourceUnitPrice }}
            />
          )
        )}
        formatter={cond(
          isPaidPlan &&
            ((quota) => (
              <DynamicT
                forKey="subscription.quota_table.included"
                interpolation={{ value: quota }}
              />
            ))
        )}
      />
    );
  },
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
  mfaEnabled: ({ id, table: { mfaEnabled } }) => {
    const isPaidPlan = id === ReservedPlanId.Hobby;
    return (
      <GenericFeatureFlag
        isEnabled={mfaEnabled}
        isAddOnForPlan={isPaidPlan}
        tipPhraseKey={cond(isPaidPlan && 'paid_add_on_feature_tip')}
        customContent={cond(
          isPaidPlan && (
            <DynamicT
              forKey="subscription.quota_table.per_month"
              interpolation={{ value: mfaPrice }}
            />
          )
        )}
      />
    );
  },
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
  ssoEnabled: ({ id, table: { ssoEnabled } }) => {
    const isPaidPlan = id === ReservedPlanId.Hobby;
    return (
      <GenericFeatureFlag
        isEnabled={ssoEnabled}
        isAddOnForPlan={isPaidPlan}
        tipPhraseKey={cond(isPaidPlan && 'paid_add_on_feature_tip')}
        customContent={cond(
          isPaidPlan && (
            <DynamicT
              forKey="subscription.quota_table.per_month_each"
              interpolation={{ value: ssoUnitPrice }}
            />
          )
        )}
      />
    );
  },
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
  organizationsEnabled: ({ id, table: { organizationsEnabled } }) => {
    const isPaidPlan = id === ReservedPlanId.Hobby;
    return (
      <GenericQuotaLimit
        quota={
          organizationsEnabled === undefined
            ? organizationsEnabled
            : organizationsEnabled
            ? maoDisplayLimit
            : 0
        }
        tipPhraseKey={cond(isPaidPlan && 'paid_quota_limit_tip')}
        extraInfo={cond(
          isPaidPlan && (
            <DynamicT
              forKey="subscription.quota_table.extra_mao_price"
              interpolation={{ value: maoUnitPrice }}
            />
          )
        )}
        formatter={cond(
          isPaidPlan &&
            ((quota) => (
              <DynamicT
                forKey="subscription.quota_table.included_mao"
                interpolation={{ value: quota }}
              />
            ))
        )}
      />
    );
  },
  allowedUsersPerOrganization: ({ table: { allowedUsersPerOrganization } }) => (
    <GenericQuotaLimit quota={allowedUsersPerOrganization} />
  ),
  invitationEnabled: ({ table: { invitationEnabled } }) =>
    invitationEnabled ? (
      <DynamicT forKey="general.coming_soon" />
    ) : (
      <GenericFeatureFlag isEnabled={invitationEnabled} />
    ),
  orgRolesLimit: ({ table: { orgRolesLimit } }) => <GenericQuotaLimit quota={orgRolesLimit} />,
  orgPermissionsLimit: ({ table: { orgPermissionsLimit } }) => (
    <GenericQuotaLimit quota={orgPermissionsLimit} />
  ),
  justInTimeProvisioningEnabled: ({ table: { justInTimeProvisioningEnabled } }) =>
    justInTimeProvisioningEnabled ? (
      <DynamicT forKey="general.coming_soon" />
    ) : (
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
  soc2ReportEnabled: ({ table: { soc2ReportEnabled } }) =>
    soc2ReportEnabled ? (
      <DynamicT forKey="general.coming_soon" />
    ) : (
      <GenericFeatureFlag isEnabled={soc2ReportEnabled} />
    ),
  hipaaOrBaaReportEnabled: ({ table: { hipaaOrBaaReportEnabled } }) =>
    hipaaOrBaaReportEnabled ? (
      <DynamicT forKey="general.coming_soon" />
    ) : (
      <GenericFeatureFlag isEnabled={hipaaOrBaaReportEnabled} />
    ),
};
