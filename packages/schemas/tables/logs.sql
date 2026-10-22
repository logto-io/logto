/* init_order = 2 */

create table logs (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  key varchar(128) not null,
  payload jsonb /* @use LogContextPayload */ not null default '{}'::jsonb,
  created_at timestamptz not null default (now()),
  /** Copy of `payload->>'userId'` kept by a trigger for lookups. Never written directly. */
  payload_user_id varchar(128),
  /** Copy of `payload->>'applicationId'` kept by a trigger for lookups. Never written directly. Unbounded because some routes log a request-supplied id before validating it, and a length limit would fail the log insert. */
  payload_application_id text,
  /** Copy of `payload->>'hookId'` kept by a trigger for lookups. Never written directly. */
  payload_hook_id varchar(21),
  primary key (id)
);

create index logs__payload_user_id_created_at
  on logs (tenant_id, payload_user_id, created_at)
  where payload_user_id is not null;

create index logs__payload_application_id_created_at
  on logs (tenant_id, payload_application_id, created_at)
  where payload_application_id is not null;

create index logs__payload_hook_id_created_at
  on logs (tenant_id, payload_hook_id, created_at)
  where payload_hook_id is not null;

/** Copies the payload keys used for lookups into their `payload_*` columns. */
create function logs__set_payload_keys() returns trigger as
$$ begin
  new.payload_user_id = new.payload->>'userId';
  new.payload_application_id = new.payload->>'applicationId';
  new.payload_hook_id = new.payload->>'hookId';
  return new;
end; $$ language plpgsql;

create trigger logs__set_payload_keys
  before insert or update of payload, payload_user_id, payload_application_id, payload_hook_id
    on logs
  for each row execute procedure logs__set_payload_keys();

create index logs__key
  on logs (tenant_id, key);

create index logs__user_id
  on logs (tenant_id, (payload->>'userId'));

create index logs__application_id
  on logs (tenant_id, (payload->>'applicationId'));

create index logs__hook_id
  on logs (tenant_id, (payload->>'hookId'));

create index logs__created_at_id
  on logs (tenant_id, created_at, id);
