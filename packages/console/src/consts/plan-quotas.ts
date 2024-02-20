import { ReservedPlanId } from '@logto/schemas';

import {
  type SubscriptionPlanTableGroupKeyMap,
  SubscriptionPlanTableGroupKey,
  type SubscriptionPlanQuota,
} from '@/types/subscriptions';

type EnabledFeatureMap = Record<string, boolean | undefined>;

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

const planTableGroupKeyMap: SubscriptionPlanTableGroupKeyMap = Object.freeze({
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
