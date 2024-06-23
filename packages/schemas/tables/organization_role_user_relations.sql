/* init_order = 3 */

/** The relations between organizations, organization roles, and users. A relation means that a user has a role in an organization. */
create table organization_role_user_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  organization_id varchar(21) not null,
  organization_role_id varchar(21) not null
    references organization_roles (id) on update cascade on delete cascade,
  user_id varchar(21) not null,
  primary key (tenant_id, organization_id, organization_role_id, user_id),
  /** User's roles in an organization should be synchronized with the user's membership in the organization. */
  foreign key (tenant_id, organization_id, user_id)
    references organization_user_relations (tenant_id, organization_id, user_id)
    on update cascade on delete cascade,
  constraint organization_role_user_relations__role_type
    check (check_organization_role_type(organization_role_id, 'User'))
);
