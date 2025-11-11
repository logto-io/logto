create type sentinel_action_result as enum ('Success', 'Failed');

create type sentinel_decision as enum ('Undecided', 'Allowed', 'Blocked', 'Challenge');

create table sentinel_activities (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id ${id_format} not null,
  /** The target that the action was performed on. */
  target_type varchar(32) /* @use SentinelActivityTargetType */ not null,
  /** The target hashed identifier. */
  target_hash varchar(64) not null,
  /** The action name that was performed. */
  action varchar(64) /* @use SentinelActivityAction */ not null,
  /** If the action was successful or not. */
  action_result sentinel_action_result not null,
  /** Additional payload data if any. */
  payload jsonb /* @use SentinelActivityPayload */ not null,
  /** The sentinel decision for the action. */
  decision sentinel_decision not null,
  /** The expiry date of the decision. For instant decisions, this is the date the activity was created. */
  decision_expires_at timestamptz not null default(now()),
  /** The time the activity was created. */
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index sentinel_activities__id
  on sentinel_activities (tenant_id, id);

create index sentinel_activities__target_type_target_hash
  on sentinel_activities (tenant_id, target_type, target_hash);

create index sentinel_activities__target_type_target_hash_action_action_result_decision
  on sentinel_activities (tenant_id, target_type, target_hash, action, action_result, decision);
