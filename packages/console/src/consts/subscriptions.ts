import { ReservedPlanId } from '@logto/schemas';
import { condArray } from '@silverhand/essentials';

import { isDevFeaturesEnabled as isDevelopmentFeaturesEnabled } from './env';

/**
 * In console, only featured plans are shown in the plan selection component.
 */
export const featuredPlanIds: string[] = [
  ReservedPlanId.Free,
  ReservedPlanId.Hobby,
  // Todo @xiaoyijun [Pricing] Remove feature flag
  ...condArray(!isDevelopmentFeaturesEnabled && ReservedPlanId.Pro),
];

/**
 * The order of featured plans in the plan selection content component.
 */
export const featuredPlanIdOrder: string[] = [
  ReservedPlanId.Free,
  ReservedPlanId.Hobby,
  ReservedPlanId.Pro,
];

export const checkoutStateQueryKey = 'checkout-state';
