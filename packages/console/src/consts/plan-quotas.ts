import {
  ReservedPlanName,
  type SubscriptionPlanTable,
  type SubscriptionPlanTableData,
  type SubscriptionPlanTableGroupKeyMap,
  SubscriptionPlanTableGroupKey,
} from '@/types/subscriptions';

export const customCssEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const appLogoAndFaviconEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const darkModeEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const i18nEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const passwordSignInEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const passwordlessSignInEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const emailConnectorsEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const smsConnectorsEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

export const userManagementEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanName.Free]: true,
  [ReservedPlanName.Hobby]: true,
  [ReservedPlanName.Pro]: true,
  [ReservedPlanName.Enterprise]: true,
};

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
  customCssEnabled: customCssEnabledMap[ReservedPlanName.Enterprise],
  appLogoAndFaviconEnabled: appLogoAndFaviconEnabledMap[ReservedPlanName.Enterprise],
  darkModeEnabled: darkModeEnabledMap[ReservedPlanName.Enterprise],
  i18nEnabled: i18nEnabledMap[ReservedPlanName.Enterprise],
  omniSignInEnabled: true,
  passwordSignInEnabled: passwordSignInEnabledMap[ReservedPlanName.Enterprise],
  passwordlessSignInEnabled: passwordlessSignInEnabledMap[ReservedPlanName.Enterprise],
  emailConnectorsEnabled: emailConnectorsEnabledMap[ReservedPlanName.Enterprise],
  smsConnectorsEnabled: smsConnectorsEnabledMap[ReservedPlanName.Enterprise],
  socialConnectorsLimit: undefined,
  standardConnectorsLimit: undefined,
  userManagementEnabled: userManagementEnabledMap[ReservedPlanName.Enterprise],
  rolesLimit: undefined,
  scopesPerRoleLimit: undefined,
  auditLogsRetentionDays: undefined,
  hooksLimit: undefined,
  communitySupportEnabled: communitySupportEnabledMap[ReservedPlanName.Enterprise],
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
