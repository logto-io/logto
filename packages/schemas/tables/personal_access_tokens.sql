/* init_order = 2 */

create table personal_access_tokens (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  /** The name of the secret. Should be unique within the user. */
  name varchar(256) not null,
  value varchar(64) not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (tenant_id, user_id, name)
);

create index personal_access_token__value on personal_access_tokens (tenant_id, value);
