/* init_order = 2 */

create table oidc_session_extensions (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  session_uid varchar(128) not null,
  account_id varchar(12) not null
    references users (id) on update cascade on delete cascade,
  last_submission jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  client_id varchar(21) null
    references applications (id) on update cascade on delete set null,
  created_at timestamptz not null default(now()),
  updated_at timestamptz not null default(now()),
  primary key (tenant_id, session_uid)
);

create trigger set_updated_at
  before update on oidc_session_extensions
  for each row
  execute procedure set_updated_at();
