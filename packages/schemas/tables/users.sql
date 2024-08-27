/* init_order = 1 */

create type users_password_encryption_method as enum ('Argon2i', 'Argon2id', 'Argon2d', 'SHA1', 'SHA256', 'MD5', 'Bcrypt');

create table users (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(12) not null,
  username varchar(128),
  primary_email varchar(128),
  primary_phone varchar(128),
  password_encrypted varchar(128),
  password_encryption_method users_password_encryption_method,
  name varchar(128),
  /** The URL that points to the user's profile picture. Mapped to OpenID Connect's `picture` claim. */ 
  avatar varchar(2048),
  /** Additional OpenID Connect standard claims that are not included in user's properties. */
  profile jsonb /* @use UserProfile */ not null default '{}'::jsonb,
  application_id varchar(21),
  identities jsonb /* @use Identities */ not null default '{}'::jsonb,
  custom_data jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  logto_config jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  mfa_verifications jsonb /* @use MfaVerifications */ not null default '[]'::jsonb,
  is_suspended boolean not null default false,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default (now()),
  updated_at timestamptz not null default (now()),
  primary key (id),
  constraint users__username
    unique (tenant_id, username),
  constraint users__primary_email
    unique (tenant_id, primary_email),
  constraint users__primary_phone
    unique (tenant_id, primary_phone)
);

create index users__id
  on users (tenant_id, id);

create index users__name
  on users (tenant_id, name);

create trigger set_updated_at
  before update on users
  for each row
  execute procedure set_updated_at();
