create table domains (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id ${id_format} not null,
  domain varchar(256) not null,
  status varchar(32) /* @use DomainStatus */ not null default('PendingVerification'),
  error_message varchar(1024),
  dns_records jsonb /* @use DomainDnsRecords */ not null default '[]'::jsonb,
  cloudflare_data jsonb /* @use CloudflareData */,
  updated_at timestamptz not null default(now()),
  created_at timestamptz not null default(now()),
  primary key (id),
  constraint domains__domain
    unique (tenant_id, domain)
);

create index domains__id on domains (tenant_id, id);
