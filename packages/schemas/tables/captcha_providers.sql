create table captcha_providers (
  tenant_id varchar(21) not null 
    references tenants (id) on update cascade on delete cascade,
  id varchar(128) not null,
  config jsonb /* @use CaptchaConfig */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  updated_at timestamptz not null default(now()),
  primary key (id),
  unique (tenant_id)
);

create index captcha_providers__id
  on captcha_providers (tenant_id, id);
