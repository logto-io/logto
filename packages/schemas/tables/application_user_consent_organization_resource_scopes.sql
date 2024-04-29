/* init_order = 3 */

/**
  The organization resource scopes (permissions) assigned to an application's consent request.
  This is different from the application_user_consent_resource_scopes table, scopes in this table
  is granted by the organization roles.
*/
create table application_user_consent_organization_resource_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the application. */
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  /** The globally unique identifier of the resource scope. */
  scope_id varchar(21) not null
    references scopes (id) on update cascade on delete cascade,
  primary key (application_id, scope_id)
);
