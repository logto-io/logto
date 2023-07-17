import {
  type SubscriptionPlanTableData,
  ReservedPlanName,
  type SubscriptionPlanTable,
  type SubscriptionPlanTableGroupKeyMap,
  SubscriptionPlanTableGroupKey,
} from '@/types/subscriptions';

export enum ReservedPlanId {
  free = 'free',
  hobby = 'hobby',
  pro = 'pro',
}

export const reservedPlanIdOrder: string[] = [
  ReservedPlanId.free,
  ReservedPlanId.hobby,
  ReservedPlanId.pro,
];

export const communitySupportEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const ticketSupportResponseTimeMap: Record<string, number | undefined> = {
  [ReservedPlanName.Free]: 0,
  [ReservedPlanName.Hobby]: 72,
  [ReservedPlanName.Pro]: 48,
  [ReservedPlanName.Enterprise]: undefined,
};

/**
 * Note: this is only for display purpose.
 *
 * `null` => Unlimited
 * `undefined` => Contact
 */
const enterprisePlanTable: SubscriptionPlanTable = {
  basePrice: undefined,
  mauUnitPrice: undefined,
  mauLimit: undefined,
  applicationsLimit: undefined,
  machineToMachineLimit: undefined,
  resourcesLimit: undefined,
  scopesPerResourceLimit: undefined,
  customDomainEnabled: true,
  omniSignInEnabled: true,
  builtInEmailConnectorEnabled: true,
  socialConnectorsLimit: null,
  standardConnectorsLimit: undefined,
  rolesLimit: undefined,
  scopesPerRoleLimit: null,
  auditLogsRetentionDays: undefined,
  hooksLimit: undefined,
  communitySupportEnabled: true,
  ticketSupportResponseTime: ticketSupportResponseTimeMap[ReservedPlanName.Enterprise],
};

/**
 * Note: this is only for display purpose.
 */
export const enterprisePlanTableData: SubscriptionPlanTableData = {
  id: 'enterprise', // Dummy
  name: ReservedPlanName.Enterprise,
  table: enterprisePlanTable,
};

export const planTableGroupKeyMap: SubscriptionPlanTableGroupKeyMap = Object.freeze({
  [SubscriptionPlanTableGroupKey.base]: ['basePrice', 'mauUnitPrice', 'mauLimit'],
  [SubscriptionPlanTableGroupKey.applications]: ['applicationsLimit', 'machineToMachineLimit'],
  [SubscriptionPlanTableGroupKey.resources]: ['resourcesLimit', 'scopesPerResourceLimit'],
  [SubscriptionPlanTableGroupKey.branding]: ['customDomainEnabled'],
  [SubscriptionPlanTableGroupKey.userAuthentication]: [
    'omniSignInEnabled',
    'builtInEmailConnectorEnabled',
    'socialConnectorsLimit',
    'standardConnectorsLimit',
  ],
  [SubscriptionPlanTableGroupKey.roles]: ['rolesLimit', 'scopesPerRoleLimit'],
  [SubscriptionPlanTableGroupKey.auditLogs]: ['auditLogsRetentionDays'],
  [SubscriptionPlanTableGroupKey.hooks]: ['hooksLimit'],
  [SubscriptionPlanTableGroupKey.support]: ['communitySupportEnabled', 'ticketSupportResponseTime'],
}) satisfies SubscriptionPlanTableGroupKeyMap;
