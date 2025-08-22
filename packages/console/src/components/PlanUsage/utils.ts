import { type AdminConsoleKey } from '@logto/phrases';
import { ReservedPlanId } from '@logto/schemas';
import { type TFuncKey } from 'i18next';

import {
  type NewSubscriptionCountBasedUsage,
  type NewSubscriptionPeriodicUsage,
  type NewSubscriptionQuota,
} from '@/cloud/types/router';
import { isDevFeaturesEnabled } from '@/consts/env';
import {
  resourceAddOnUnitPrice,
  machineToMachineAddOnUnitPrice,
  tenantMembersAddOnUnitPrice,
  mfaAddOnUnitPrice,
  enterpriseSsoAddOnUnitPrice,
  organizationAddOnUnitPrice,
  tokenAddOnUnitPrice,
  hooksAddOnUnitPrice,
  securityFeaturesAddOnUnitPrice,
  samlApplicationsAddOnUnitPrice,
  thirdPartyApplicationsAddOnUnitPrice,
  rbacEnabledAddOnUnitPrice,
} from '@/consts/subscriptions';
import { isProPlan } from '@/utils/subscription';

/**
 * Unlike other usage keys,
 * `rbacEnabled` add-on is not a part of the standard Logto SKU quota key,
 * instead it is calculated based on the `userRolesLimit` and `machineToMachineRolesLimit`
 * two quotas.
 * So we need to manually define it here, and calculate the status based on the two quotas.
 */
enum CustomUsageKey {
  RbacEnabled = 'rbacEnabled',
}

type UsageKey =
  | keyof Pick<
      NewSubscriptionQuota,
      | 'mauLimit'
      | 'organizationsLimit'
      | 'mfaEnabled'
      | 'enterpriseSsoLimit'
      | 'resourcesLimit'
      | 'machineToMachineLimit'
      | 'tenantMembersLimit'
      | 'tokenLimit'
      | 'hooksLimit'
      | 'securityFeaturesEnabled'
      | 'thirdPartyApplicationsLimit'
      | 'samlApplicationsLimit'
    >
  | CustomUsageKey.RbacEnabled;

// We decide not to show `hooksLimit` usage in console for now.
export const usageKeys: UsageKey[] = [
  'mauLimit',
  'organizationsLimit',
  'mfaEnabled',
  'enterpriseSsoLimit',
  // TODO: remove dev features check
  ...(isDevFeaturesEnabled ? [CustomUsageKey.RbacEnabled] : []),
  'resourcesLimit',
  'machineToMachineLimit',
  // TODO: remove dev features check
  ...(isDevFeaturesEnabled
    ? (['samlApplicationsLimit', 'thirdPartyApplicationsLimit'] satisfies UsageKey[])
    : []),
  'tenantMembersLimit',
  'tokenLimit',
  'securityFeaturesEnabled',
];

export const usageKeyPriceMap: Record<UsageKey, number> = {
  mauLimit: 0,
  organizationsLimit: organizationAddOnUnitPrice,
  mfaEnabled: mfaAddOnUnitPrice,
  enterpriseSsoLimit: enterpriseSsoAddOnUnitPrice,
  resourcesLimit: resourceAddOnUnitPrice,
  machineToMachineLimit: machineToMachineAddOnUnitPrice,
  tenantMembersLimit: tenantMembersAddOnUnitPrice,
  tokenLimit: tokenAddOnUnitPrice,
  hooksLimit: hooksAddOnUnitPrice,
  samlApplicationsLimit: samlApplicationsAddOnUnitPrice,
  thirdPartyApplicationsLimit: thirdPartyApplicationsAddOnUnitPrice,
  securityFeaturesEnabled: securityFeaturesAddOnUnitPrice,
  rbacEnabled: rbacEnabledAddOnUnitPrice,
};

export const titleKeyMap: Record<
  UsageKey,
  TFuncKey<'translation', 'admin_console.subscription.usage'>
> = {
  mauLimit: 'mau.title',
  organizationsLimit: 'organizations.title',
  mfaEnabled: 'mfa.title',
  enterpriseSsoLimit: 'enterprise_sso.title',
  resourcesLimit: 'api_resources.title',
  machineToMachineLimit: 'machine_to_machine.title',
  tenantMembersLimit: 'tenant_members.title',
  tokenLimit: 'tokens.title',
  hooksLimit: 'hooks.title',
  securityFeaturesEnabled: 'security_features.title',
  thirdPartyApplicationsLimit: 'third_party_applications.title',
  samlApplicationsLimit: 'saml_applications.title',
  rbacEnabled: 'rbacEnabled.title',
};

const tooltipKeyMap: Record<
  UsageKey,
  TFuncKey<'translation', 'admin_console.subscription.usage'>
> = {
  mauLimit: 'mau.tooltip',
  organizationsLimit: 'organizations.tooltip',
  mfaEnabled: 'mfa.tooltip',
  enterpriseSsoLimit: 'enterprise_sso.tooltip',
  resourcesLimit: 'api_resources.tooltip',
  machineToMachineLimit: 'machine_to_machine.tooltip',
  tenantMembersLimit: 'tenant_members.tooltip',
  tokenLimit: 'tokens.tooltip',
  hooksLimit: 'hooks.tooltip',
  securityFeaturesEnabled: 'security_features.tooltip',
  thirdPartyApplicationsLimit: 'third_party_applications.tooltip',
  samlApplicationsLimit: 'saml_applications.tooltip',
  rbacEnabled: 'rbacEnabled.tooltip',
};

const enterpriseTooltipKeyMap: Record<
  UsageKey,
  TFuncKey<'translation', 'admin_console.subscription.usage'>
> = {
  mauLimit: 'mau.tooltip_for_enterprise',
  organizationsLimit: 'organizations.tooltip_for_enterprise',
  mfaEnabled: 'mfa.tooltip_for_enterprise',
  enterpriseSsoLimit: 'enterprise_sso.tooltip_for_enterprise',
  resourcesLimit: 'api_resources.tooltip_for_enterprise',
  machineToMachineLimit: 'machine_to_machine.tooltip_for_enterprise',
  tenantMembersLimit: 'tenant_members.tooltip_for_enterprise',
  tokenLimit: 'tokens.tooltip_for_enterprise',
  hooksLimit: 'hooks.tooltip_for_enterprise',
  securityFeaturesEnabled: 'security_features.tooltip',
  thirdPartyApplicationsLimit: 'third_party_applications.tooltip',
  samlApplicationsLimit: 'saml_applications.tooltip',
  rbacEnabled: 'rbacEnabled.tooltip',
};

const isRbacEnabled = ({ userRolesLimit, machineToMachineRolesLimit }: NewSubscriptionQuota) =>
  userRolesLimit === null && machineToMachineRolesLimit === null;

export const formatNumber = (number: number): string => {
  return number.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// --- Utility functions for formatting quotas and usage---
export const getUsageByKey = (
  key: UsageKey,
  {
    periodicUsage,
    countBasedUsage,
    basicQuota,
  }: {
    periodicUsage: NewSubscriptionPeriodicUsage;
    countBasedUsage: NewSubscriptionCountBasedUsage;
    basicQuota: NewSubscriptionQuota;
  }
) => {
  if (key === 'mauLimit' || key === 'tokenLimit') {
    return periodicUsage[key];
  }

  // Show organization usage status in in-use/not-in-use state.
  if (key === 'organizationsLimit') {
    // If the basic quota is a non-zero number, show the usage in `usage(number-typed) (First {{basicQuota}} included)` format.
    if (typeof basicQuota[key] === 'number' && basicQuota[key] !== 0) {
      return countBasedUsage[key];
    }

    return countBasedUsage[key] > 0;
  }

  if (key === CustomUsageKey.RbacEnabled) {
    const { userRolesLimit, machineToMachineRolesLimit } = countBasedUsage;

    // If the userRoles usage is greater than 0 or the machineToMachineRoles usage is greater than 1, then RBAC is enabled.
    // Note: machineToMachineRolesLimit is always 1 for default Logto management API usage.
    return userRolesLimit > 0 || machineToMachineRolesLimit > 1;
  }

  return countBasedUsage[key];
};

export const getQuotaByKey = (key: UsageKey, subscriptionQuota: NewSubscriptionQuota) => {
  if (key === CustomUsageKey.RbacEnabled) {
    return isRbacEnabled(subscriptionQuota);
  }

  return subscriptionQuota[key];
};

export const getToolTipByKey = (
  key: UsageKey,
  basicQuota: NewSubscriptionQuota,
  isEnterprisePlan: boolean
): AdminConsoleKey | undefined => {
  // Do not show tooltip if the RBAC quota is enabled (userRolesLimit and machineToMachineRolesLimit) is unlimited.
  if (key === CustomUsageKey.RbacEnabled) {
    return isRbacEnabled(basicQuota) ? undefined : 'subscription.usage.rbacEnabled.tooltip';
  }

  // Do not show tooltip if the basic quota is null (unlimited) for m2m/API resource add-on.
  if (
    (key === 'machineToMachineLimit' ||
      key === 'resourcesLimit' ||
      key === 'thirdPartyApplicationsLimit') &&
    basicQuota[key] === null
  ) {
    return undefined; // Do not show tooltip for unlimited basic quota
  }

  if (key === 'organizationsLimit') {
    if (isEnterprisePlan) {
      return 'subscription.usage.organizations.tooltip_for_enterprise';
    }

    // Show tooltip for number-typed basic quota for 'organizationsLimit'.
    if (typeof basicQuota[key] === 'number' && basicQuota[key] > 0) {
      return 'subscription.usage.organizations.tooltip_for_enterprise_with_numbered_basic_quota';
    }

    return 'subscription.usage.organizations.tooltip';
  }

  return `subscription.usage.${
    isEnterprisePlan ? enterpriseTooltipKeyMap[key] : tooltipKeyMap[key]
  }`;
};

export const shouldHideQuotaNotice = (
  key: UsageKey,
  basicQuota: NewSubscriptionQuota,
  planId: string
) => {
  // Only applicable for Pro plans
  if (!isProPlan(planId)) {
    return;
  }

  // Hide the quota notice if the RBAC is disabled in the basic quota.
  if (key === CustomUsageKey.RbacEnabled) {
    return !isRbacEnabled(basicQuota);
  }

  // Hide the quota notice if the basic quota is 0;
  return basicQuota[key] === 0;
};

/**
 * During the pro plan migration,
 * we need to hide the new added usage keys for the legacy Pro plan.
 * - RBAC enabled
 * - thirdPartyApplicationsLimit
 *
 * TODO: clean up this function after the migration is complete.
 */
export const filterNewUsageKeysForLegacyPro = (key: UsageKey, planId: string) => {
  const newUsageKeys = Object.freeze([CustomUsageKey.RbacEnabled, 'thirdPartyApplicationsLimit']);

  if (!newUsageKeys.includes(key)) {
    return true;
  }

  const isProPlanId = isProPlan(planId);

  if (isProPlanId && planId !== ReservedPlanId.Pro202509) {
    return false; // Hide new usage keys for legacy Pro plan
  }

  return true;
};
