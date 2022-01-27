create type password_encryption_method as enum ('SaltAndPepper');

create table users (
  id varchar(24) not null,
  username varchar(128) unique,
  primary_email varchar(128) unique,
  primary_phone varchar(128) unique,
  password_encrypted varchar(128),
  password_encryption_method password_encryption_method,
  password_encryption_salt varchar(128),
  role_names jsonb /* @use RoleNames */,
  primary key (id)
);
