create type application_type as enum ('Native', 'SPA', 'Traditional');

create table applications (
  id varchar(128) not null,
  name varchar(256) not null,
  type application_type not null,
  oidc_client_metadata jsonb /* @use OidcClientMetadata */ not null,
  created_at bigint not null default(extract(epoch from now())),
  primary key (id)
);
