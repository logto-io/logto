/* init_order = 2 */

/** The organization scopes (permissions) that client ID metadata document (CIMD) clients of the tenant can request. */
create table cimd_organization_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the organization scope. */
  organization_scope_id varchar(21) not null,
  primary key (tenant_id, organization_scope_id),
  /** The tenant-aware composite foreign key guarantees the referenced organization scope belongs to the same tenant. */
  foreign key (tenant_id, organization_scope_id)
    references organization_scopes (tenant_id, id)
    on update cascade on delete cascade
);
