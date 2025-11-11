create table custom_profile_fields (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id ${id_format} not null,
  name varchar(128) not null,
  type varchar(128) not null /* @use CustomProfileFieldType */,
  label varchar(128) not null default '',
  description varchar(256),
  required boolean not null default false,
  config jsonb /* @use CustomProfileFieldConfig */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  sie_order int2 not null default 0,
  primary key (id),
  constraint custom_profile_fields__name
    unique (tenant_id, name)
);

create or replace function custom_profile_fields__increment_sie_order() returns trigger as
$$ begin
  new.sie_order = (
    select coalesce(max(sie_order), 0)
    from custom_profile_fields
    where tenant_id = (
      select id from tenants where db_user = current_user
    )
  ) + 1;
  return new;
end; $$ language plpgsql;

create trigger custom_profile_fields__increment_sie_order before insert on custom_profile_fields
  for each row execute procedure custom_profile_fields__increment_sie_order();
