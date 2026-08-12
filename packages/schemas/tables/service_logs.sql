create table service_logs (
  id varchar(21) not null,
  tenant_id varchar(21) not null,
  type varchar(64) not null,
  payload jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index service_logs__id
  on service_logs (id);

create index service_logs__tenant_id__type__created_at
  on service_logs (tenant_id, type, created_at);

/* Global oldest-first scan for the age-based retention prune (the composite index above leads with
   `tenant_id`, so it can't drive a tenant-agnostic `created_at` range scan). */
create index service_logs__created_at
  on service_logs (created_at);

/* Cloud email-logs read path: streams a tenant's sent + failed hosted-email rows in
   (created_at desc, id desc) keyset order (in the composite index above `type` sits between
   `tenant_id` and `created_at`, so a read spanning both email types cannot stream in time order
   and needs a full top-N sort) */
create index service_logs__email__tenant_id__created_at__id
  on service_logs (tenant_id, created_at desc, id desc)
  where type in ('sendEmail', 'sendEmailFailed');

/* Cloud email-logs recipient filter: case-insensitive exact recipient lookups in the same
   keyset order, without inspecting every email-log payload of the tenant */
create index service_logs__email__tenant_id__recipient__created_at__id
  on service_logs (tenant_id, lower(payload->'data'->>'to'), created_at desc, id desc)
  where type in ('sendEmail', 'sendEmailFailed');

/* Cloud delivery-event webhook write path: single-row lookup of the `sendEmail` row that carries
   the provider-assigned message id. Doubly partial on purpose — rows without a message id (all
   history before the id was captured, and providers that return none) never enter the index, so
   its size and per-insert maintenance stay proportional to id-carrying rows only. The strict `=`
   in the webhook's update provably implies `is not null`, so the planner can use it. */
create index service_logs__email__provider_message_id
  on service_logs ((payload->>'providerMessageId'))
  where type = 'sendEmail' and payload->>'providerMessageId' is not null;

/* no_after_each */
