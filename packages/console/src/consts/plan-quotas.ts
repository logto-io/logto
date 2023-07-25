import {
  type SubscriptionPlanTable,
  type SubscriptionPlanTableData,
  type SubscriptionPlanTableGroupKeyMap,
  SubscriptionPlanTableGroupKey,
  ReservedPlanName,
} from '@/types/subscriptions';

import { ReservedPlanId } from './subscriptions';

type EnabledFeatureMap = Record<string, boolean | undefined>;

export const customCssEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const appLogoAndFaviconEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const darkModeEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const i18nEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const passwordSignInEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const passwordlessSignInEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const emailConnectorsEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const smsConnectorsEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const userManagementEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const communitySupportEnabledMap: EnabledFeatureMap = {
  [ReservedPlanId.free]: true,
  [ReservedPlanId.hobby]: true,
  [ReservedPlanId.pro]: true,
};

export const ticketSupportResponseTimeMap: Record<string, number | undefined> = {
  [ReservedPlanId.free]: 0,
  [ReservedPlanId.hobby]: 72,
  [ReservedPlanId.pro]: 48,
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
    'omniSignInEnabled',
    'passwordSignInEnabled',
    'passwordlessSignInEnabled',
    'emailConnectorsEnabled',
    'smsConnectorsEnabled',
    'socialConnectorsLimit',
    'standardConnectorsLimit',
  ],
  [SubscriptionPlanTableGroupKey.roles]: [
    'userManagementEnabled',
    'rolesLimit',
    'scopesPerRoleLimit',
  ],
  [SubscriptionPlanTableGroupKey.auditLogs]: ['auditLogsRetentionDays'],
  [SubscriptionPlanTableGroupKey.hooks]: ['hooksLimit'],
  [SubscriptionPlanTableGroupKey.support]: ['communitySupportEnabled', 'ticketSupportResponseTime'],
}) satisfies SubscriptionPlanTableGroupKeyMap;
