create type application_type as enum ('Native', 'SPA', 'Traditional');

create table applications (
  id varchar(21) not null,
  name varchar(256) not null,
  secret varchar(64) not null,
  description text,
  type application_type not null,
  oidc_client_metadata jsonb /* @use OidcClientMetadata */ not null,
  custom_client_metadata jsonb /* @use CustomClientMetadata */ not null default '{}'::jsonb,
  created_at timestamptz not null default(now()),
  primary key (id)
);
