export function getManagementApiResourceIndicator<TenantId extends string>(
  tenantId: TenantId
): `https://${TenantId}.logto.app/api`;

export function getManagementApiResourceIndicator<TenantId extends string, Path extends string>(
  tenantId: TenantId,
  path: Path
): `https://${TenantId}.logto.app/${Path}`;

export function getManagementApiResourceIndicator(tenantId: string, path = 'api') {
  return `https://${tenantId}.logto.app/${path}`;
}

export const isManagementApi = (tenantId: string, indicator: string) =>
  getManagementApiResourceIndicator(tenantId) === indicator;
