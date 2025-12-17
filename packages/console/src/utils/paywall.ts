import { ReservedPlanId } from '@logto/schemas';

import { type SubscriptionCountBasedUsage } from '@/cloud/types/router';

/**
 * Determines whether a paywall should be enforced in the UI for a given plan.
 *
 * @param planId - The subscription plan ID
 * @param quotaKey - The quota key to check
 * @returns true if the paywall should be enforced (show paywall/limit), false otherwise
 *
 * @example
 * ```typescript
 * // Development plan user creating an application
 * shouldEnforcePaywallInUI(ReservedPlanId.Development, 'applicationsLimit')
 * // => false (no paywall shown)
 *
 * // Development plan user inviting 21st team member
 * shouldEnforcePaywallInUI(ReservedPlanId.Development, 'tenantMembersLimit')
 * // => true (shows "Contact us" message)
 *
 * // Free plan user creating 4th application
 * shouldEnforcePaywallInUI(ReservedPlanId.Free, 'applicationsLimit')
 * // => true (shows upgrade prompt)
 * ```
 */
export const shouldEnforcePaywallInUI = <T extends keyof SubscriptionCountBasedUsage>(
  planId: string,
  quotaKey: T
): boolean => {
  if (planId === ReservedPlanId.Development) {
    // Currently, only tenant members paywall is enforced for Development plan
    if (quotaKey === 'tenantMembersLimit') {
      return true;
    }

    return false;
  }

  // All other plans: Always enforce paywalls
  return true;
};
