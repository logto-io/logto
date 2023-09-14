create type sentinel_activity_result as enum ('Success', 'Failed');

create table sentinel_activities (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  /** The subject (actor) that performed the action. */
  subject_type varchar(32) /* @use SentinelActivitySubjectType */ not null,
  /** The target that the action was performed on. */
  target_type varchar(32) /* @use SentinelActivityTargetType */ not null,
  /** The target identifier. */
  target_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  /** The related log id if any. */
  log_id varchar(21)
    references logs (id) on update cascade on delete cascade,
  /** The action name that was performed. */
  action varchar(64) /* @use SentinelActivityAction */ not null,
  /** If the action was successful or not. */
  result sentinel_activity_result not null,
  /** Additional payload data if any. */
  payload jsonb /* @use SentinelActivityPayload */ not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);
