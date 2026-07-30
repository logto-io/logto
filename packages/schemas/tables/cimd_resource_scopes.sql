/* init_order = 3 */

/** The API resource scopes (permissions) that client ID metadata document (CIMD) clients of the tenant can request. */
create table cimd_resource_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the API resource scope. */
  scope_id varchar(21) not null,
  primary key (tenant_id, scope_id),
  /** The tenant-aware composite foreign key guarantees the referenced scope belongs to the same tenant. */
  foreign key (tenant_id, scope_id)
    references scopes (tenant_id, id)
    on update cascade on delete cascade
);
