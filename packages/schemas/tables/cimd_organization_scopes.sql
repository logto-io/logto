/* init_order = 2 */

/** The organization scopes (permissions) that client ID metadata document (CIMD) clients of the tenant can request. */
create table cimd_organization_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the organization scope. */
  organization_scope_id varchar(21) not null
    references organization_scopes (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_scope_id)
);
