import { ReservedPlanId } from '@logto/schemas';

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
export const resourceAddOnUnitPrice = 4;
export const machineToMachineAddOnUnitPrice = 8;
export const tenantMembersAddOnUnitPrice = 8;
export const mfaAddOnUnitPrice = 48;
export const enterpriseSsoAddOnUnitPrice = 48;
export const organizationAddOnUnitPrice = 48;
/* === Add-on unit price (in USD) === */

/**
 * In console, only featured plans are shown in the plan selection component.
 */
export const featuredPlanIds: string[] = [ReservedPlanId.Free, ReservedPlanId.Pro];

/**
 * The order of featured plans in the plan selection content component.
 */
export const featuredPlanIdOrder: string[] = [ReservedPlanId.Free, ReservedPlanId.Pro];

export const checkoutStateQueryKey = 'checkout-state';
