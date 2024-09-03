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
   * In recent refactoring, the `hobby` plan is now treated as the `pro` plan.
   * Only use this plan ID to check if a plan is a `pro` plan or not.
   * This plan ID will be renamed to `pro` after legacy Stripe data is migrated by @darcyYe
   *
   * Todo @darcyYe:
   * - LOG-7846: Rename `hobby` to `pro` and `pro` to `legacy-pro`
   * - LOG-8339: Migrate legacy Stripe data
   */
  Hobby = 'hobby',
  Pro = 'pro',
  /**
   * @deprecated
   * Should not use this plan ID, we only use this tag as a record for the legacy `pro` plan since we will rename the `hobby` plan to be `pro`.
   */
  GrandfatheredPro = 'grandfathered-pro',
  Development = 'dev',
  /**
   * This plan ID is reserved for Admin tenant.
   * In our new pricing model, we plan to add a special plan for Admin tenant, previously, admin tenant is using the `pro` plan, which is not suitable.
   */
  Admin = 'admin',
}
