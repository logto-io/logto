/* init_order = 3 */

/** The relations between organizations, organization roles, and applications. A relation means that an application has a role in an organization. */
create table organization_role_application_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  organization_id varchar(21) not null,
  organization_role_id varchar(21) not null
    references organization_roles (id) on update cascade on delete cascade,
  application_id varchar(21) not null,
  primary key (tenant_id, organization_id, organization_role_id, application_id),
  /** Application's roles in an organization should be synchronized with the application's membership in the organization. */
  foreign key (tenant_id, organization_id, application_id)
    references organization_application_relations (tenant_id, organization_id, application_id)
    on update cascade on delete cascade,
  constraint organization_role_application_relations__role_type
    check (check_organization_role_type(organization_role_id, 'MachineToMachine'))
);
