export enum TenantTag {
  /* Development tenants are free to use and are not meant to be used in production */
  Development = 'development',
  /* @deprecated */
  Staging = 'staging',
  /* Production tenants have several subscription plans */
  Production = 'production',
}
