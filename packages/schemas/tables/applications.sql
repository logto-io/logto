create type application_type as enum ('Native', 'SPA', 'Traditional');

create table applications (
  id varchar(128) not null,
  name varchar(256) not null,
  description text,
  type application_type not null,
  oidc_client_metadata jsonb /* @use OidcClientMetadata */ not null,
  id_token_ttl bigint not null default(86400),
  refresh_token_ttl bigint not null default(2592000),
  created_at timestamptz not null default(now()),
  primary key (id)
);
