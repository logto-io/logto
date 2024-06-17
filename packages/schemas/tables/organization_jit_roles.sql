/* init_order = 2 */

/** The organization roles that will be automatically provisioned to users when they join an organization through JIT. */
create table organization_jit_roles (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The ID of the organization. */
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  /** The organization role ID that will be automatically provisioned. */
  organization_role_id varchar(21) not null
    references organization_roles (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_id, organization_role_id)
);
