import { ReservedPlanId } from '@logto/schemas';

import { isDevFeaturesEnabled } from './env';

/**
 * Shared quota limits between the featured plan content in the `CreateTenantModal` and the `PlanComparisonTable`.
 */
export const freePlanMauLimit = 50_000;
export const freePlanM2mLimit = 1;
export const freePlanRoleLimit = 1;
export const freePlanPermissionsLimit = 1;
export const freePlanAuditLogsRetentionDays = 3;
export const proPlanAuditLogsRetentionDays = 14;

// TODO: currently we do not provide a good way to retrieve add-on items unit price in console, we hence manually defined the unit price here, will implement the API soon.
/* === Add-on unit price (in USD) === */
export const proPlanBasePrice = 16;
export const resourceAddOnUnitPrice = 4;
export const machineToMachineAddOnUnitPrice = 8;
export const tenantMembersAddOnUnitPrice = 8;
export const mfaAddOnUnitPrice = 48;
export const enterpriseSsoAddOnUnitPrice = 48;
export const organizationAddOnUnitPrice = 48;
export const tokenAddOnUnitPrice = 80;
export const hooksAddOnUnitPrice = 2;
export const securityFeaturesAddOnUnitPrice = 48;
export const thirdPartyApplicationsAddOnUnitPrice = 8;
export const samlApplicationsAddOnUnitPrice = 96;
export const rbacEnabledAddOnUnitPrice = 32;
/* === Add-on unit price (in USD) === */

/**
 * The order of plans in the plan selection content component.
 * Unlike the `featuredPlanIds`, include both grandfathered plans and public visible featured plans.
 * We need to properly identify the order of the grandfathered plans compared to the new public visible featured plans.
 */
export const planIdOrder: Record<string, number> = Object.freeze({
  [ReservedPlanId.Free]: 0,
  [ReservedPlanId.Pro]: 1,
  [ReservedPlanId.Pro202411]: 1,
  [ReservedPlanId.Pro202509]: 1,
});

export const checkoutStateQueryKey = 'checkout-state';

/** The latest pro plan id we are using. */
export const latestProPlanId = isDevFeaturesEnabled
  ? ReservedPlanId.Pro202509
  : ReservedPlanId.Pro202411;

/**
 * In console, only featured plans are shown in the plan selection component.
 * we will this to filter out the public visible featured plans.
 */
export const featuredPlanIds: readonly string[] = Object.freeze([
  ReservedPlanId.Free,
  latestProPlanId,
]);
