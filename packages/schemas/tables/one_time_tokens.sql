/* init_order = 2 */

create table one_time_tokens (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id ${id_format} not null,
  email varchar(128) not null,
  token varchar(256) not null,
  context jsonb /* @use OneTimeTokenContext */ not null default '{}'::jsonb,
  status varchar(64) /* @use OneTimeTokenStatus */ not null default 'active',
  created_at timestamptz not null default(now()),
  expires_at timestamptz not null,
  primary key (id)
);

create index one_time_token__email_status on one_time_tokens (tenant_id, email, status);

create unique index one_time_token__token on one_time_tokens (tenant_id, token);
