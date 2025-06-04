create type custom_profile_field_type
  as enum ('Text', 'Number', 'Date', 'Checkbox', 'Select', 'Url', 'Regex', 'Address', 'Fullname');

create table custom_profile_fields (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  name varchar(128) not null default '',
  type custom_profile_field_type not null,
  label varchar(128) not null default '',
  description varchar(256),
  required boolean not null default false,
  placeholder varchar(256),
  min_length int4,
  max_length int4,
  min_value int4,
  max_value int4,
  format varchar(128),
  options jsonb /* @use FieldOptions */,
  parts jsonb /* @use FieldParts */,
  created_at timestamptz not null default(now()),
  sie_order int2 not null default 0,
  primary key (id),
  constraint custom_profile_fields__name
    unique (tenant_id, name),
  constraint custom_profile_fields__sie_order
    unique (tenant_id, sie_order)
);

create or replace function custom_profile_fields__increment_sie_order() returns trigger as
$$ begin
  new.sie_order = (select coalesce(max(sie_order), 0) from custom_profile_fields where tenant_id = new.tenant_id) + 1;
  return new;
end; $$ language plpgsql;

create trigger custom_profile_fields__increment_sie_order before insert on custom_profile_fields
  for each row execute procedure custom_profile_fields__increment_sie_order();
