/* init_order = 2 */

/** The organization role allow relations for application-level access control. */
create table application_access_control_org_role_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  organization_role_id varchar(21) not null
    references organization_roles (id) on update cascade on delete cascade,
  primary key (tenant_id, application_id, organization_id, organization_role_id),
  constraint application_access_control_org_role_relations__role_type
    check (check_organization_role_type(organization_role_id, 'User'))
);
