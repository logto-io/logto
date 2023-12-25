import { ReservedPlanId } from '@logto/schemas';

/**
 * In console, only featured plans are shown in the plan selection component.
 */
export const featuredPlanIds: string[] = [ReservedPlanId.Free, ReservedPlanId.Hobby];

/**
 * The order of featured plans in the plan selection content component.
 */
export const featuredPlanIdOrder: string[] = [
  ReservedPlanId.Free,
  ReservedPlanId.Hobby,
  ReservedPlanId.Pro,
];

export const checkoutStateQueryKey = 'checkout-state';
