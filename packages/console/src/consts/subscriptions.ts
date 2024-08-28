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

/**
 * In console, only featured plans are shown in the plan selection component.
 */
export const featuredPlanIds: string[] = [ReservedPlanId.Free, ReservedPlanId.Pro];

/**
 * The order of featured plans in the plan selection content component.
 */
export const featuredPlanIdOrder: string[] = [ReservedPlanId.Free, ReservedPlanId.Pro];

export const checkoutStateQueryKey = 'checkout-state';
