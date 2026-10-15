/**
 * Logto-provided predefined subscription plan IDs.
 *
 * In theory, the subscription plan ID will be a random string,
 * but Logto provides some predefined subscription plans and their IDs are reserved plan IDs.
 */
export enum ReservedPlanId {
  Free = 'free',
  /**
   * @deprecated
   * Grandfathered Pro plan ID deprecated from 2024-11.
   * Use {@link Pro202411} instead.
   */
  Pro = 'pro',
  Development = 'dev',
  /**
   * This plan ID is reserved for Admin tenant.
   * In our new pricing model, we plan to add a special plan for Admin tenant, previously, admin tenant is using the `pro` plan, which is not suitable.
   */
  Admin = 'admin',
  /**
   * @deprecated
   * Grandfathered Pro plan ID deprecated from 2025-09.
   * Use {@link Pro202509} instead.
   */
  Pro202411 = 'pro-202411',
  /**
   * Latest Pro plan ID applied from 2025-09.
   */
  Pro202509 = 'pro-202509',
  /**
   * Self-hosted Pro plan, unlocked by installing a license key on a self-hosted instance.
   *
   * Unlike the plans above, this one is never returned by the Cloud subscription API: it is carried
   * in the signed license payload and resolved locally. See `licensePayloadGuard`.
   */
  SelfHostedPro = 'self-hosted-pro',
  /**
   * Self-hosted Enterprise plan, unlocked by installing a license key on a self-hosted instance.
   * See {@link SelfHostedPro}.
   */
  SelfHostedEnterprise = 'self-hosted-enterprise',
}

/**
 * Tenant subscription related Redis cache keys.
 *
 * We use Redis to cache the tenant subscription data to reduce the number of requests to the Cloud.
 * Both @logto/core and @logto/cloud will need to access the cache, so we define the cache keys here as the SSOT.
 */
export enum SubscriptionRedisCacheKey {
  Subscription = 'subscription',
}
