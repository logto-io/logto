/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable @silverhand/fp/no-let */
export type OgcioTenantSeeder = Record<string, OgcioSeeder>;

export type OgcioSeeder = {
  organizations: OrganizationSeeder[];
  organization_permissions: OrganizationPermissionSeeder[];
  organization_roles: OrganizationRoleSeeder[];
  applications: ApplicationSeeder[];
  resources: ResourceSeeder[];
  resource_permissions: ResourcePermissionSeeder[];
  resource_roles: ResourceRoleSeeder[];
};

export type OrganizationSeeder = {
  name: string;
  description: string;
};

export type OrganizationPermissionSeeder = {
  actions: string[];
  entities: string[];
};

export type OrganizationRoleSeeder = {
  name: string;
  actions?: string[];
  entities?: string[];
  specific_permissions?: string[];
  description: string;
};

export type ApplicationSeeder = {
  name: string;
  description: string;
  type: string;
  redirect_uri: string;
  logout_redirect_uri: string;
};

export type ResourceSeeder = {
  id: string;
  name: string;
  indicator: string;
};

export type ResourcePermissionSeeder = {
  for_resource_ids: string[];
  actions: string[];
  entities: string[];
};

export type ResourceRoleSeeder = {
  name: string;
  description: string;
  permissions: ScopePerResourceRoleSeeder[];
};

export type ScopePerResourceRoleSeeder = {
  for_resource_ids: string[];
  actions?: string[];
  entities?: string[];
  specific_permissions?: string[];
  description: string;
};

let inputSeeder: OgcioTenantSeeder | undefined;
export const getTenantSeederData = (): OgcioTenantSeeder => {
  if (inputSeeder === undefined) {
    throw new Error('Tenant seeder data missing');
  }

  return inputSeeder;
};

export const setTenantSeederData = (toSet: OgcioTenantSeeder): void => {
  inputSeeder = toSet;
};
