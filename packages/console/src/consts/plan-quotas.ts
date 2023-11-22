import { ReservedPlanId } from '@logto/schemas';

import {
  type SubscriptionPlanTable,
  type SubscriptionPlanTableData,
  type SubscriptionPlanTableGroupKeyMap,
  SubscriptionPlanTableGroupKey,
  ReservedPlanName,
  type SubscriptionPlanQuota,
} from '@/types/subscriptions';

type EnabledFeatureMap = Record<string, boolean | undefined>;

export const customCssEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const appLogoAndFaviconEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const darkModeEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const i18nEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const passwordSignInEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const passwordlessSignInEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const emailConnectorsEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const smsConnectorsEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const userManagementEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const communitySupportEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: true,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const ticketSupportResponseTimeMap: Record<string, number | undefined> = {
  [ReservedPlanId.Free]: 0,
  [ReservedPlanId.Hobby]: 72,
  [ReservedPlanId.Pro]: 48,
};

export const ssoEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.Free]: false,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
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
  customCssEnabled: true,
  appLogoAndFaviconEnabled: true,
  darkModeEnabled: true,
  i18nEnabled: true,
  mfaEnabled: true,
  omniSignInEnabled: true,
  passwordSignInEnabled: true,
  passwordlessSignInEnabled: true,
  emailConnectorsEnabled: true,
  smsConnectorsEnabled: true,
  socialConnectorsLimit: undefined,
  standardConnectorsLimit: undefined,
  userManagementEnabled: true,
  rolesLimit: undefined,
  scopesPerRoleLimit: undefined,
  auditLogsRetentionDays: undefined,
  hooksLimit: undefined,
  communitySupportEnabled: true,
  ticketSupportResponseTime: undefined,
  organizationsEnabled: true,
  ssoEnabled: true,
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
  [SubscriptionPlanTableGroupKey.branding]: [
    'customDomainEnabled',
    'customCssEnabled',
    'appLogoAndFaviconEnabled',
    'darkModeEnabled',
    'i18nEnabled',
  ],
  [SubscriptionPlanTableGroupKey.userAuthentication]: [
    'mfaEnabled',
    'omniSignInEnabled',
    'passwordSignInEnabled',
    'passwordlessSignInEnabled',
    'emailConnectorsEnabled',
    'smsConnectorsEnabled',
    'socialConnectorsLimit',
    'standardConnectorsLimit',
    'ssoEnabled',
  ],
  [SubscriptionPlanTableGroupKey.roles]: [
    'userManagementEnabled',
    'rolesLimit',
    'scopesPerRoleLimit',
  ],
  [SubscriptionPlanTableGroupKey.organizations]: ['organizationsEnabled'],
  [SubscriptionPlanTableGroupKey.auditLogs]: ['auditLogsRetentionDays'],
  [SubscriptionPlanTableGroupKey.hooks]: ['hooksLimit'],
  [SubscriptionPlanTableGroupKey.support]: ['communitySupportEnabled', 'ticketSupportResponseTime'],
}) satisfies SubscriptionPlanTableGroupKeyMap;

export const planQuotaItemOrder = Object.values(planTableGroupKeyMap).flat();

/**
 * Unreleased quota keys will be added here, and it will effect the following:
 * - Related quota items will have a "Coming soon" tag in the plan selection component.
 * - Related quota items will be hidden from the downgrade plan notification modal.
 */
export const comingSoonQuotaKeys: Array<keyof SubscriptionPlanQuota> = ['ssoEnabled'];
