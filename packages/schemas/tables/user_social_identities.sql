/* init_order = 2 */

create table user_social_identities (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  user_id varchar(12) not null references users (id) on update cascade on delete cascade,
  /** Unique social provider identifier. E.g., 'google', 'facebook', etc. */
  target varchar(256) not null,
  /** Provider user identity id */
  identity_id varchar(256) not null,
  details jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  updated_at timestamptz not null default(now()),
  primary key (tenant_id, id),
  constraint user_social_identities__target__identity_id
    unique (tenant_id, target, identity_id)
);

create trigger set_updated_at
  before update on user_social_identities
  for each row
  execute procedure set_updated_at();
