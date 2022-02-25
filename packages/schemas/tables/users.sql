create type users_password_encryption_method as enum ('SaltAndPepper');

create table users (
  id varchar(24) not null,
  username varchar(128) unique,
  primary_email varchar(128) unique,
  primary_phone varchar(128) unique,
  password_encrypted varchar(128),
  password_encryption_method users_password_encryption_method,
  password_encryption_salt varchar(128),
  name varchar(128),
  avatar varchar(256),
  role_names jsonb /* @use RoleNames */ not null default '[]'::jsonb,
  identities jsonb /* @use Identities */ not null default '{}'::jsonb,
  custom_data jsonb /* @use ArbitraryObject */ not null default '{}'::jsonb,
  primary key (id)
);
