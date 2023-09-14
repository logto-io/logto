create type sentinel_activity_result as enum ('Success', 'Failed');

create table sentinel_activities (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  subject_type varchar(32) /* @use SentinelActivitySubjectType */ not null,
  target_type varchar(32) /* @use SentinelActivityTargetType */ not null,
  target_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  log_id varchar(21)
    references logs (id) on update cascade on delete cascade,
  action varchar(64) /* @use SentinelActivityAction */ not null,
  result sentinel_activity_result not null,
  payload jsonb /* @use LogContextPayload */ not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);
ex
