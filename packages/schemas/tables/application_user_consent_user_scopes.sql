/* init_order = 2 */

/** The user scopes (permissions) assigned to an application */
create table application_user_consent_user_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the application. */
  application_id varchar(36) not null
    references applications (id) on update cascade on delete cascade,
  /** The unique UserScope enum value @see (@logto/core-kit/open-id.js) for more details */
  user_scope varchar(64) not null,
  primary key (application_id, user_scope)
);
