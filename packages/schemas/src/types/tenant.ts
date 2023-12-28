export enum TenantTag {
  /* Development tenants are free to use but are not meant to be used as production environment. */
  Development = 'development',
  /* A production tenant must have an associated subscription plan, even if it's a free plan. */
  Production = 'production',
}
