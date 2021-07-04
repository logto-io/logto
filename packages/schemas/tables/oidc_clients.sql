create table oidc_clients (
  client_id varchar(128) not null,
  metadata jsonb /* @use OidcClientMetadata */ not null,
  created_at bigint not null default(extract(epoch from now())),
  primary key (client_id)
);
