/* init_order = 2 */

/**
  The organization scopes (permissions) that client ID metadata document (CIMD) clients of the tenant can request.
  Rows are an allowlist: an empty table allows nothing (deny-all), and an unrestricted state is not expressible.
*/
create table cimd_organization_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the organization scope. */
  organization_scope_id varchar(21) not null,
  primary key (tenant_id, organization_scope_id),
  foreign key (tenant_id, organization_scope_id)
    references organization_scopes (tenant_id, id) on update cascade on delete cascade
);
