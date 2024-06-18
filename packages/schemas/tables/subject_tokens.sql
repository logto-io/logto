create table subject_tokens (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(25) not null,
  context jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  created_at timestamptz not null default(now()),
  /* It is intented to not reference to user or application table, it can be userId or applicationId, for audit only */
  creator_id varchar(32) not null,
  primary key (id)
);

create index subject_token__id on subject_tokens (tenant_id, id);
