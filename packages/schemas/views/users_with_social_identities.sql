/* parent_table = users */

--- Create user with social identies view ---
CREATE OR REPLACE VIEW users_with_social_identities AS
--- select all columns from users table except identities,
SELECT
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
      SELECT jsonb_object_agg(
        usi.target,
        jsonb_build_object(
          'userId', usi.identity_id,
          'details', usi.details
        )
      )
      FROM user_social_identities usi
      WHERE usi.user_id = u.id AND usi.tenant_id = u.tenant_id
    ),
    '{}'::jsonb
    -- join with existing identities
  )  AS identities
FROM users u;
