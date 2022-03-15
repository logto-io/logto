create table sign_in_experiences (
  id varchar(128) not null,
  branding jsonb /* @use Branding */ not null default '{}'::jsonb,
  language_info jsonb /* @use LanguageInfo */ not null default '{}'::jsonb,
  terms_of_use jsonb /* @use TermsOfUse */ not null default '{}'::jsonb,
  forget_password_enabled boolean not null default false,
  sign_in_methods jsonb /* @use SignInMethods */ not null default '{}'::jsonb,
  social_sign_in_connector_ids jsonb /* @use ConnectorIds */ not null default '[]'::jsonb,
  primary key (id)
);
