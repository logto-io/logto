create type sign_in_mode as enum ('SignIn', 'Register', 'SignInAndRegister');
create type agree_to_terms_policy as enum ('Automatic', 'ManualRegistrationOnly', 'Manual');

create table sign_in_experiences (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  color jsonb /* @use Color */ not null,
  branding jsonb /* @use Branding */ not null,
  hide_logto_branding boolean not null default false,
  language_info jsonb /* @use LanguageInfo */ not null,
  terms_of_use_url varchar(2048),
  privacy_policy_url varchar(2048),
  /** The policy that determines how users agree to the terms of use and privacy policy. */
  agree_to_terms_policy agree_to_terms_policy not null default 'Automatic',
  sign_in jsonb /* @use SignIn */ not null,
  sign_up jsonb /* @use SignUp */ not null,
  social_sign_in jsonb /* @use SocialSignIn */ not null default '{}'::jsonb,
  social_sign_in_connector_targets jsonb /* @use ConnectorTargets */ not null default '[]'::jsonb,
  sign_in_mode sign_in_mode not null default 'SignInAndRegister',
  custom_css text,
  custom_content jsonb /* @use CustomContent */ not null default '{}'::jsonb,
  custom_ui_assets jsonb /* @use CustomUiAssets */,
  password_policy jsonb /* @use PartialPasswordPolicy */ not null default '{}'::jsonb,
  mfa jsonb /* @use Mfa */ not null default '{}'::jsonb,
  single_sign_on_enabled boolean not null default false,
  support_email text,
  support_website_url text,
  unknown_session_redirect_url text,
  captcha_policy jsonb /* @use CaptchaPolicy */ not null default '{}'::jsonb,
  sentinel_policy jsonb /* @use SentinelPolicy */ not null default '{}'::jsonb,
  email_blocklist_policy jsonb /* @use EmailBlocklistPolicy */ not null default '{}'::jsonb,
  forgot_password_methods jsonb /* @use ForgotPasswordMethods */ default '[]'::jsonb,
  primary key (tenant_id, id)
);
