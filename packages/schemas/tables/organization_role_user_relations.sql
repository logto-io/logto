/* init_order = 2 */

/** The relations between organizations, organization roles, and users. A relation means that a user has a role in an organization. */
create table organization_role_user_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  organization_role_id varchar(21) not null
    references organization_roles (id) on update cascade on delete cascade,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_id, organization_role_id, user_id)
);
