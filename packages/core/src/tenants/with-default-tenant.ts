import type TenantContext from './TenantContext.js';

/**
 * Run a task against the default tenant of this deployment.
 *
 * The tenant is held for as long as the task runs, the way a request holds the tenant it is served
 * by, so its database pool is not closed under the task. It takes no tenant ID, so it cannot be
 * turned into a way to reach an arbitrary tenant. Use it only for work the admin tenant has to do
 * with the default tenant's resources, e.g. sending an email through its email connector.
 */
export type WithDefaultTenant = <T>(run: (tenant: TenantContext) => Promise<T>) => Promise<T>;
