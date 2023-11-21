export enum TenantTag {
  /* Development tenants are free to use but are not meant to be used as production environment */
  Development = 'development',
  /* @deprecated */
  Staging = 'staging',
  /* Production tenants have several subscription plans */
  Production = 'production',
}
