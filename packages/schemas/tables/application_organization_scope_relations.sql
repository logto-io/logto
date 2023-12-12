/* init_order = 2 */

/** The organization scopes (permissions) assigned to an application. */
create table application_organization_scope_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the application. */
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  /** The globally unique identifier of the organization scope. */
  organization_scope_id varchar(21) not null
    references organization_scopes (id) on update cascade on delete cascade,
  primary key (application_id, organization_scope_id)
);
