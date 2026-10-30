/* init_order = 1 */

create type users_password_encryption_method as enum ('Argon2i', 'Argon2id', 'Argon2d', 'SHA1', 'SHA256', 'MD5', 'Bcrypt', 'Legacy');

create table users (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(128) not null,
  username varchar(128),
  primary_email varchar(128),
  primary_phone varchar(128),
  password_encrypted varchar(256),
  password_encryption_method users_password_encryption_method,
  name varchar(128),
  /** The URL that points to the user's profile picture. Mapped to OpenID Connect's `picture` claim. */ 
  avatar varchar(2048),
  /** Additional OpenID Connect standard claims that are not included in user's properties. */
  profile jsonb /* @use UserProfile */ not null default '{}'::jsonb,
  application_id varchar(21),
  cimd_client_id varchar(2048),
  identities jsonb /* @use Identities */ not null default '{}'::jsonb,
  custom_data jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  logto_config jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  mfa_verifications jsonb /* @use MfaVerifications */ not null default '[]'::jsonb,
  is_suspended boolean not null default false,
  is_password_expired boolean not null default false,
  last_sign_in_at timestamptz,
  password_updated_at timestamptz,
  created_at timestamptz not null default (now()),
  updated_at timestamptz not null default (now()),
  /** `lower(primary_email)` kept by a trigger for case-insensitive lookups. Never written directly. Three times the source width because under ICU or builtin Unicode locales one character can lower-case to three. */
  primary_email_lower varchar(384),
  /** `lower(username)` kept by a trigger for case-insensitive lookups. Never written directly. Three times the source width because under ICU or builtin Unicode locales one character can lower-case to three. */
  username_lower varchar(384),
  primary key (id),
  constraint users__username
    unique (tenant_id, username),
  constraint users__primary_email
    unique (tenant_id, primary_email),
  constraint users__primary_phone
    unique (tenant_id, primary_phone)
);

/* Unique index on (tenant_id, id) required for foreign key constraint in organization_user_relations table. */
create unique index users__id
  on users (tenant_id, id);

create index users__name
  on users (tenant_id, name);

create index users_mfa_verifications_gin
  on users using gin (mfa_verifications jsonb_path_ops);

/* Supports case-insensitive username lookups and case-flip conflict detection. */
create index users__tenant_lower_username
  on users (tenant_id, lower(username))
  where username is not null;

create index users__primary_email_lower
  on users (tenant_id, primary_email_lower)
  where primary_email_lower is not null;

create index users__username_lower
  on users (tenant_id, username_lower)
  where username_lower is not null;

/** Copies the lower-cased email and username into their `*_lower` columns, overwriting any direct write to them. */
create function users__set_lower_columns() returns trigger as
$$ begin
  new.primary_email_lower = lower(new.primary_email);
  new.username_lower = lower(new.username);
  return new;
end; $$ language plpgsql;

create trigger users__set_lower_columns
  before insert or update of primary_email, username, primary_email_lower, username_lower
    on users
  for each row execute procedure users__set_lower_columns();

create trigger set_updated_at
  before update on users
  for each row
  execute procedure set_updated_at();
