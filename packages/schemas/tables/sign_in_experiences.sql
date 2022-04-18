create table sign_in_experiences (
  id varchar(21) not null,
  branding jsonb /* @use Branding */ not null,
  language_info jsonb /* @use LanguageInfo */ not null,
  terms_of_use jsonb /* @use TermsOfUse */ not null,
  sign_in_methods jsonb /* @use SignInMethods */ not null,
  social_sign_in_connector_ids jsonb /* @use ConnectorIds */ not null default '[]'::jsonb,
  primary key (id)
);
