--- Create user with social identies view ---
create view users_with_social_identities as
--- select all columns from users table except identities,
select
  u.tenant_id,
  u.id,
  u.username,
  u.primary_email,
  u.primary_phone,
  u.password_encrypted,
  u.password_encryption_method,
  u.name,
  u.avatar,
  u.profile,
  u.application_id,
  u.custom_data,
  u.logto_config,
  u.mfa_verifications,
  u.is_suspended,
  u.last_sign_in_at,
  u.created_at,
  u.updated_at,
  -- custom merged identities column here
  u.identities || COALESCE(
    (
      -- Aggregate social identities from user_social_identities table
      select jsonb_object_agg(
        usi.target,
        jsonb_build_object(
          'userId', usi.identity_id,
          'details', usi.details
        )
      )
      from user_social_identities usi
      where usi.user_id = u.id and usi.tenant_id = u.tenant_id
    ),
    '{}'::jsonb
    -- join with existing identities
  ) as identities
from users u;
