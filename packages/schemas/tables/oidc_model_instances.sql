/* init_order = 1 */

create table oidc_model_instances (
  tenant_id varchar(64) not null
    references tenants (id) on update cascade on delete cascade,
  model_name varchar(64) not null,
  id varchar(128) not null,
  payload jsonb /* @use OidcModelInstancePayload */ not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  /** Copy of `payload->>'grantId'` kept by a trigger for lookups. Never written directly. */
  payload_grant_id varchar(128),
  /** Copy of `payload->>'accountId'` kept by a trigger for lookups. Never written directly. */
  payload_account_id varchar(128),
  /** Copy of `payload->>'uid'` kept by a trigger for lookups. Never written directly. */
  payload_uid varchar(128),
  /** Copy of `payload->>'userCode'` kept by a trigger for lookups. Never written directly. */
  payload_user_code varchar(128),
  primary key (id),
  constraint oidc_model_instances__model_name_id
    unique (tenant_id, model_name, id)
);

create index oidc_model_instances__expires_at
  on oidc_model_instances (tenant_id, expires_at);

/* Stand-in that keeps the session, grant, and revocation lookups seeking within one
   (tenant, model) partition while the tenant-ID widening drops the payload indexes - unlike the
   service_logs stand-ins it outlives the concurrent restores, because the restored payload
   indexes cannot serve queries that still read the payload keys directly, and it is removed only
   once those queries are migrated to the payload_* columns fleet-wide */
create index oidc_model_instances__standin_model_name_expires_at
  on oidc_model_instances (tenant_id, model_name, expires_at);

/* Partial on payload key existence so rows without accountId (e.g. client credentials tokens) stay out of the index. The parameter-free predicate stays provable under generic query plans, but matching queries must include the payload ? 'accountId' clause. */
/** Copies the payload keys used for lookups into their `payload_*` columns. */
create function oidc_model_instances__set_payload_keys() returns trigger as
$$ begin
  new.payload_grant_id = new.payload->>'grantId';
  new.payload_account_id = new.payload->>'accountId';
  new.payload_uid = new.payload->>'uid';
  new.payload_user_code = new.payload->>'userCode';
  return new;
end; $$ language plpgsql;

create trigger oidc_model_instances__set_payload_keys
  before insert or update of payload, payload_grant_id, payload_account_id, payload_uid, payload_user_code
    on oidc_model_instances
  for each row execute procedure oidc_model_instances__set_payload_keys();

alter table oidc_model_instances set (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 5000,
  autovacuum_analyze_threshold = 2000
);

create index oidc_model_instances__model_name_payload_account_id_expires_at
  on oidc_model_instances (tenant_id, model_name, payload_account_id, expires_at)
  where payload_account_id is not null;

create index oidc_model_instances__model_name_payload_grant_id
  on oidc_model_instances (tenant_id, model_name, payload_grant_id)
  where payload_grant_id is not null;

create index oidc_model_instances__model_name_payload_uid
  on oidc_model_instances (tenant_id, model_name, payload_uid)
  where payload_uid is not null;

create index oidc_model_instances__model_name_payload_user_code
  on oidc_model_instances (tenant_id, model_name, payload_user_code)
  where payload_user_code is not null;
