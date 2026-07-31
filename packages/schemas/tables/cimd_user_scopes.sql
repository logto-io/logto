/* init_order = 2 */

/**
  The user scopes (permissions) that client ID metadata document (CIMD) clients of the tenant can request.
  Rows are an allowlist: an empty table allows nothing (deny-all), and an unrestricted state is not expressible.
*/
create table cimd_user_scopes (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The unique UserScope enum value @see (@logto/core-kit/open-id.js) for more details */
  user_scope varchar(64) not null,
  primary key (tenant_id, user_scope)
);
