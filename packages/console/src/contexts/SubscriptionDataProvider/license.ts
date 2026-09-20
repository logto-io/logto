import { ossDefaultQuota } from '@logto/schemas';

import { type Subscription, type SubscriptionQuota } from '@/cloud/types/router';
import { defaultSubscriptionQuota, defaultTenantResponse } from '@/consts/tenants';
import { type License } from '@/types/license';

/**
 * Derive the subscription of a self-hosted deployment from its installed license.
 *
 * Only the plan and the period come from the key. `isEnterprisePlan` stays `false` on purpose: in
 * Console it switches on the Cloud add-on billing notices, which mean nothing for a license, and the
 * license-unlocked features read the license's own `quota` instead. Without a license the answer is
 * the fixed `dev` plan Console has always assumed outside Cloud, so every existing check keeps
 * passing.
 */
export const buildSelfHostedSubscription = (license?: License): Subscription => {
  const { subscription: defaultSubscription } = defaultTenantResponse;

  if (!license) {
    return defaultSubscription;
  }

  return {
    ...defaultSubscription,
    planId: license.plan,
    // A license carries no period of its own; the time the key was installed is the closest thing
    // the response has, and its expiration is the end of the period the key covers.
    currentPeriodStart: new Date(license.installedAt),
    currentPeriodEnd: new Date(license.expiresAt),
  };
};

/**
 * Derive the Cloud-shaped quota of a self-hosted deployment from its installed license.
 *
 * A license grants a small, fixed set of self-hosted entitlements (`LicenseQuota`) rather than a
 * Cloud SKU quota, and the two vocabularies are disjoint apart from `samlApplicationsLimit`, which
 * keeps the same meaning on both sides. That one key is carried over so the SAML limit notices can
 * read it where Cloud does; every other key keeps its current default outside Cloud, and the
 * feature flags are read from the context's `license.quota` instead of being translated.
 */
export const buildSelfHostedSubscriptionQuota = (license?: License): SubscriptionQuota => ({
  ...defaultSubscriptionQuota,
  samlApplicationsLimit: (license?.quota ?? ossDefaultQuota).samlApplicationsLimit,
});
