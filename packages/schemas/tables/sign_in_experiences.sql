create table sign_in_experiences (
  id varchar(128) not null,
  company_info jsonb /* @use CompanyInfo */ not null,
  branding jsonb /* @use Branding */ not null,
  terms_of_use jsonb /* @use TermsOfUse */ not null,
  forget_password_enabled boolean not null default(true),
  localization jsonb /* @use Localization */ not null,
  sign_in_methods jsonb /* @use SignInMethodSettings */ not null
)
