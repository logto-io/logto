import type TenantContext from './TenantContext.js';

/**
 * Run a task against another tenant of this deployment.
 *
 * The tenant is held for as long as the task runs, the way a request holds the tenant it is served
 * by, so its database pool is not closed under the task. Use it only for work one tenant has to do
 * with another tenant's resources, e.g. the admin tenant sending an email through the default
 * tenant's email connector.
 */
export type WithTenant = <T>(
  tenantId: string,
  run: (tenant: TenantContext) => Promise<T>
) => Promise<T>;
