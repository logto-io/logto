create table jobs (
  tenant_id varchar(64) not null
    references tenants (id) on update cascade on delete cascade,
  /** For webhooks, the target `logs.id` (`deliveryId` initially, or the new `logId` on redelivery). */
  id varchar(21) not null,
  /** Selects the handler, such as `webhook`. */
  type varchar(64) not null,
  /** The unit that concurrency, circuit-breaker, and row caps apply to. For webhooks, `hookId`. */
  group_key varchar(128) not null,
  /** Optional active-uniqueness key. For webhooks, `deliveryId`. */
  dedupe_key varchar(128),
  /** Serialized handler input (`text` preserves exact JSON key order for webhook bodies). */
  payload text not null default '',
  /** How many times the row has been claimed — acts as a monotonic fencing token with `claimed_by`. */
  attempts int2 not null default 0,
  /** When the row is next due. While claimed, when the lease expires. */
  next_attempt_at timestamptz not null default (now()),
  /** Random per-process worker id holding the lease. Null while waiting. */
  claimed_by varchar(21),
  created_at timestamptz not null default (now()),
  primary key (id)
);

/* Find due rows across tenants. */
create index jobs__next_attempt_at
  on jobs (next_attempt_at);

/* Enforce bounded per-tenant and per-group row caps. */
create index jobs__type_group_key
  on jobs (tenant_id, type, group_key);

/* Reject concurrent deliveries or redeliveries for the same `deliveryId`. */
create unique index jobs__type_dedupe_key
  on jobs (tenant_id, type, dedupe_key)
  where dedupe_key is not null;

/* Aggressive cleanup for insert/update/delete queue churn. */
alter table jobs set (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_analyze_scale_factor = 0.01,
  autovacuum_vacuum_threshold = 1000,
  autovacuum_analyze_threshold = 500
);
