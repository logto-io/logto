import type TenantContext from './TenantContext.js';

export default abstract class TenantPoolContext<Tenant extends TenantContext = TenantContext> {
  public abstract get(tenantId: string): Promise<Tenant>;
}
