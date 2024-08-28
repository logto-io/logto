/* init_order = 1 */

create type application_type as enum ('Native', 'SPA', 'Traditional', 'MachineToMachine', 'Protected');

create table applications (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  name varchar(256) not null,
  secret varchar(64) not null,
  description text,
  type application_type not null,
  oidc_client_metadata jsonb /* @use OidcClientMetadata */ not null,
  custom_client_metadata jsonb /* @use CustomClientMetadata */ not null default '{}'::jsonb,
  protected_app_metadata jsonb /* @use ProtectedAppMetadata */,
  is_third_party boolean not null default false,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index applications__id
  on applications (tenant_id, id);

create index applications__is_third_party
  on applications (tenant_id, is_third_party);

create unique index applications__protected_app_metadata_host
  on applications (
    (protected_app_metadata->>'host')
  );

create unique index applications__protected_app_metadata_custom_domain
  on applications (
    (protected_app_metadata->'customDomains'->0->>'domain')
  );

create function check_application_type(application_id varchar(21), target_type application_type) returns boolean as
$$ begin
  return (select type from applications where id = application_id) = target_type;
end; $$ language plpgsql set search_path = public;
