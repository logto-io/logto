import { ReservedPlanId } from '@logto/schemas';

import { type LogtoSkuQuota } from '@/types/skus';

/**
 * Manually add this support quota item to the plan since it will be compared in the downgrade plan notification modal.
 */
export const ticketSupportResponseTimeMap: Record<string, number> = {
  [ReservedPlanId.Free]: 0,
  [ReservedPlanId.Pro]: 48,
};

/**
 * Define the order of quota items in the downgrade plan notification modal and not eligible for downgrade plan modal.
 */
export const skuQuotaItemOrder: Array<keyof LogtoSkuQuota> = [
  'mauLimit',
  'tokenLimit',
  'applicationsLimit',
  'machineToMachineLimit',
  'thirdPartyApplicationsLimit',
  'resourcesLimit',
  'scopesPerResourceLimit',
  'socialConnectorsLimit',
  'mfaEnabled',
  'enterpriseSsoLimit',
  'userRolesLimit',
  'machineToMachineRolesLimit',
  'scopesPerRoleLimit',
  'organizationsLimit',
  'auditLogsRetentionDays',
  'hooksLimit',
  'customJwtEnabled',
  'subjectTokenEnabled',
  'bringYourUiEnabled',
  'ticketSupportResponseTime',
];

export const comingSoonSkuQuotaKeys: Array<keyof LogtoSkuQuota> = [];
