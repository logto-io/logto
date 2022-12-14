create type sign_in_mode as enum ('SignIn', 'Register', 'SignInAndRegister');

create table sign_in_experiences (
  id varchar(21) not null,
  color jsonb /* @use Color */ not null,
  branding jsonb /* @use Branding */ not null,
  language_info jsonb /* @use LanguageInfo */ not null,
  terms_of_use_url varchar(2048),
  sign_in jsonb /* @use SignIn */ not null,
  sign_up jsonb /* @use SignUp */ not null,
  social_sign_in_connector_targets jsonb /* @use ConnectorTargets */ not null default '[]'::jsonb,
  sign_in_mode sign_in_mode not null default 'SignInAndRegister',
  primary key (id)
);
