/* init_order = 2 */

/** The relations between organizations and applications. It indicates membership of applications in organizations. For now only machine-to-machine applications are supported. */
create table organization_application_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_id, application_id),
  constraint application_type
    check (check_application_type(application_id, 'MachineToMachine'))
);
