create table sign_in_methods (
  id varchar(128) not null,
  name varchar(128) not null,
  metadata jsonb /* @use SignInMethodMetadata */ not null default '{}'::jsonb
)