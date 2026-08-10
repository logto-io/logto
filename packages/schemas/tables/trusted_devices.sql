/* init_order = 2 */

/** A revocable server-side credential that can fulfill sign-in MFA for a user. */
create table trusted_devices (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  user_id varchar(12) not null
    references users (id) on update cascade on delete cascade,
  secret_hash bytea /* @use BufferLike */ not null,
  user_agent text,
  ip text,
  country varchar(16),
  city text,
  created_at timestamptz not null default(now()),
  last_used_at timestamptz not null default(now()),
  expires_at timestamptz not null,
  primary key (id)
);

create index trusted_devices__tenant_user_expires_at
  on trusted_devices (tenant_id, user_id, expires_at);

create index trusted_devices__tenant_expires_at
  on trusted_devices (tenant_id, expires_at);
