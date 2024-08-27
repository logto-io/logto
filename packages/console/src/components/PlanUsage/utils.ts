import { type TFuncKey } from 'i18next';

import { type NewSubscriptionQuota } from '@/cloud/types/router';

type UsageKey = Pick<
  NewSubscriptionQuota,
  | 'mauLimit'
  | 'organizationsEnabled'
  | 'mfaEnabled'
  | 'enterpriseSsoLimit'
  | 'resourcesLimit'
  | 'machineToMachineLimit'
  | 'tenantMembersLimit'
  | 'tokenLimit'
  | 'hooksLimit'
>;

export const usageKeys: Array<keyof UsageKey> = [
  'mauLimit',
  'organizationsEnabled',
  'mfaEnabled',
  'enterpriseSsoLimit',
  'resourcesLimit',
  'machineToMachineLimit',
  'tenantMembersLimit',
  'tokenLimit',
  'hooksLimit',
];

export const usageKeyMap: Record<
  keyof UsageKey,
  TFuncKey<'translation', 'admin_console.subscription.usage'>
> = {
  mauLimit: 'mau.description',
  organizationsEnabled: 'organizations.description',
  mfaEnabled: 'mfa.description',
  enterpriseSsoLimit: 'enterprise_sso.description',
  resourcesLimit: 'api_resources.description',
  machineToMachineLimit: 'machine_to_machine.description',
  tenantMembersLimit: 'tenant_members.description',
  tokenLimit: 'tokens.description',
  hooksLimit: 'hooks.description',
};

export const titleKeyMap: Record<
  keyof UsageKey,
  TFuncKey<'translation', 'admin_console.subscription.usage'>
> = {
  mauLimit: 'mau.title',
  organizationsEnabled: 'organizations.title',
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
  organizationsEnabled: 'organizations.tooltip',
  mfaEnabled: 'mfa.tooltip',
  enterpriseSsoLimit: 'enterprise_sso.tooltip',
  resourcesLimit: 'api_resources.tooltip',
  machineToMachineLimit: 'machine_to_machine.tooltip',
  tenantMembersLimit: 'tenant_members.tooltip',
  tokenLimit: 'tokens.tooltip',
  hooksLimit: 'hooks.tooltip',
};

export const formatNumber = (number: number): string => {
  return number.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
};
