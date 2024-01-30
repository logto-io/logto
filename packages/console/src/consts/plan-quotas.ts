import { ReservedPlanId } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';

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
  [ReservedPlanId.Hobby]: 48,
  [ReservedPlanId.Pro]: 48,
};

export const allowedUsersPerOrganizationMap: Record<string, Nullable<number> | undefined> = {
  [ReservedPlanId.Free]: 0,
  [ReservedPlanId.Hobby]: null,
  [ReservedPlanId.Pro]: undefined,
};

export const invitationEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanId.Free]: false,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const orgRolesLimitMap: Record<string, Nullable<number> | undefined> = {
  [ReservedPlanId.Free]: 0,
  [ReservedPlanId.Hobby]: null,
  [ReservedPlanId.Pro]: undefined,
};

export const orgPermissionsLimitMap: Record<string, Nullable<number> | undefined> = {
  [ReservedPlanId.Free]: 0,
  [ReservedPlanId.Hobby]: null,
  [ReservedPlanId.Pro]: undefined,
};

export const justInTimeProvisioningEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanId.Free]: false,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const soc2ReportEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanId.Free]: false,
  [ReservedPlanId.Hobby]: true,
  [ReservedPlanId.Pro]: true,
};

export const hipaaOrBaaReportEnabledMap: Record<string, boolean | undefined> = {
  [ReservedPlanId.Free]: false,
  [ReservedPlanId.Hobby]: false,
  [ReservedPlanId.Pro]: false,
};

/**
 * Note: this is only for display purpose.
 *
 * `null` => Unlimited
 * `undefined` => Contact
 */
const enterprisePlanTable: SubscriptionPlanTable = {
  basePrice: undefined,
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
  mfaEnabled: undefined,
  omniSignInEnabled: true,
  passwordSignInEnabled: true,
  passwordlessSignInEnabled: true,
  emailConnectorsEnabled: true,
  smsConnectorsEnabled: true,
  socialConnectorsLimit: undefined,
  standardConnectorsLimit: undefined,
  userManagementEnabled: true,
  rolesLimit: undefined,
  machineToMachineRolesLimit: undefined,
  scopesPerRoleLimit: undefined,
  auditLogsRetentionDays: undefined,
  hooksLimit: undefined,
  communitySupportEnabled: true,
  ticketSupportResponseTime: undefined,
  organizationsEnabled: undefined,
  invitationEnabled: true,
  justInTimeProvisioningEnabled: true,
  ssoEnabled: undefined,
  soc2ReportEnabled: true,
  hipaaOrBaaReportEnabled: true,
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
  [SubscriptionPlanTableGroupKey.base]: ['basePrice', 'mauLimit', 'tokenLimit'],
  [SubscriptionPlanTableGroupKey.applications]: [
    'applicationsLimit',
    'machineToMachineLimit',
    'thirdPartyApplicationsLimit',
  ],
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
    'mfaEnabled',
    'ssoEnabled',
  ],
  [SubscriptionPlanTableGroupKey.roles]: [
    'userManagementEnabled',
    'rolesLimit',
    'machineToMachineRolesLimit',
    'scopesPerRoleLimit',
  ],
  [SubscriptionPlanTableGroupKey.organizations]: [
    'organizationsEnabled',
    'allowedUsersPerOrganization',
    'invitationEnabled',
    'orgRolesLimit',
    'orgPermissionsLimit',
    'justInTimeProvisioningEnabled',
  ],
  [SubscriptionPlanTableGroupKey.auditLogs]: ['auditLogsRetentionDays'],
  [SubscriptionPlanTableGroupKey.hooks]: ['hooksLimit'],
  [SubscriptionPlanTableGroupKey.support]: [
    'communitySupportEnabled',
    'ticketSupportResponseTime',
    'soc2ReportEnabled',
    'hipaaOrBaaReportEnabled',
  ],
}) satisfies SubscriptionPlanTableGroupKeyMap;

export const planQuotaItemOrder = Object.values(planTableGroupKeyMap).flat();

/**
 * Unreleased quota keys will be added here, and it will effect the following:
 * - Related quota items will have a "Coming soon" tag in the plan selection component.
 * - Related quota items will be hidden from the downgrade plan notification modal.
 */
export const comingSoonQuotaKeys: Array<keyof SubscriptionPlanQuota> = [];
