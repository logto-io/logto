/* init_order = 3 */

/** The relations between organization roles and resource scopes (normal scopes). It indicates which resource scopes are available to which organization roles. */
create table organization_role_resource_scope_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  organization_role_id varchar(21) not null
    references organization_roles (id) on update cascade on delete cascade,
  scope_id varchar(21) not null
    references scopes (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_role_id, scope_id)
);
