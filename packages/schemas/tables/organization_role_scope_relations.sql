/* init_order = 2 */

/** The relations between organization roles and organization scopes. It indicates which organization scopes are available to which organization roles. */
create table organization_role_scope_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  organization_role_id ${id_format} not null
    references organization_roles (id) on update cascade on delete cascade,
  organization_scope_id varchar(36) not null
    references organization_scopes (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_role_id, organization_scope_id)
);
