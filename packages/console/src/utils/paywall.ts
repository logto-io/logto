import { type SubscriptionCountBasedUsage } from '@/cloud/types/router';

/**
 * Determines whether a paywall should be enforced in the UI for a given plan.
 *
 * @param isDevTenant - Whether the tenant is on a Development plan
 * @param quotaKey - The quota key to check
 * @returns true if the paywall should be enforced (show paywall/limit), false otherwise
 *
 * @example
 * ```typescript
 * // Development plan user creating an application
 * shouldEnforcePaywallInUI(true, 'applicationsLimit')
 * // => false (no paywall shown)
 *
 * // Development plan user inviting 21st team member
 * shouldEnforcePaywallInUI(true, 'tenantMembersLimit')
 * // => true (shows "Contact us" message)
 *
 * // Free plan user creating 4th application
 * shouldEnforcePaywallInUI(false, 'applicationsLimit')
 * // => true (shows upgrade prompt)
 * ```
 */
export const shouldEnforcePaywallInUI = <T extends keyof SubscriptionCountBasedUsage>(
  isDevTenant: boolean,
  quotaKey: T
): boolean => {
  if (isDevTenant) {
    // Currently, only tenant members paywall is enforced for Development plan
    if (quotaKey === 'tenantMembersLimit') {
      return true;
    }

    return false;
  }

  // All other plans: Always enforce paywalls
  return true;
};
