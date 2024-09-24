import { type TFuncKey } from 'i18next';

import { type NewSubscriptionQuota } from '@/cloud/types/router';
import {
  resourceAddOnUnitPrice,
  machineToMachineAddOnUnitPrice,
  tenantMembersAddOnUnitPrice,
  mfaAddOnUnitPrice,
  enterpriseSsoAddOnUnitPrice,
  organizationAddOnUnitPrice,
  tokenAddOnUnitPrice,
  hooksAddOnUnitPrice,
} from '@/consts/subscriptions';

export type UsageKey = Pick<
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
>;

// We decide not to show `hooksLimit` usage in console for now.
export const usageKeys: Array<keyof UsageKey> = [
  'mauLimit',
  'organizationsLimit',
  'mfaEnabled',
  'enterpriseSsoLimit',
  'resourcesLimit',
  'machineToMachineLimit',
  'tenantMembersLimit',
  'tokenLimit',
];

export const usageKeyPriceMap: Record<keyof UsageKey, number> = {
  mauLimit: 0,
  organizationsLimit: organizationAddOnUnitPrice,
  mfaEnabled: mfaAddOnUnitPrice,
  enterpriseSsoLimit: enterpriseSsoAddOnUnitPrice,
  resourcesLimit: resourceAddOnUnitPrice,
  machineToMachineLimit: machineToMachineAddOnUnitPrice,
  tenantMembersLimit: tenantMembersAddOnUnitPrice,
  tokenLimit: tokenAddOnUnitPrice,
  hooksLimit: hooksAddOnUnitPrice,
};

export const titleKeyMap: Record<
  keyof UsageKey,
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
};

export const tooltipKeyMap: Record<
  keyof UsageKey,
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
};

export const enterpriseTooltipKeyMap: Record<
  keyof UsageKey,
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
};

export const formatNumber = (number: number): string => {
  return number.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
};
