import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Add UUID support - Part 3: Foreign key tables with user_id
 *
 * This migration expands user_id foreign key columns to support UUID v7 (36 characters).
 * Uses conditional logic to handle different database versions.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    // Alter all tables with user_id foreign keys (conditionally, as not all versions have all columns)
    await pool.query(sql`
      do $$
      begin
        -- users_roles.user_id
        if exists (select 1 from information_schema.columns where table_name = 'users_roles' and column_name = 'user_id') then
          alter table users_roles alter column user_id type varchar(36);
        end if;

        -- organization_user_relations.user_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_user_relations' and column_name = 'user_id') then
          alter table organization_user_relations alter column user_id type varchar(36);
        end if;

        -- user_sso_identities.user_id
        if exists (select 1 from information_schema.columns where table_name = 'user_sso_identities' and column_name = 'user_id') then
          alter table user_sso_identities alter column user_id type varchar(36);
        end if;

        -- passcodes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'passcodes' and column_name = 'user_id') then
          alter table passcodes alter column user_id type varchar(36);
        end if;

        -- logs.user_id
        if exists (select 1 from information_schema.columns where table_name = 'logs' and column_name = 'user_id') then
          alter table logs alter column user_id type varchar(36);
        end if;

        -- verification_statuses.user_id
        if exists (select 1 from information_schema.columns where table_name = 'verification_statuses' and column_name = 'user_id') then
          alter table verification_statuses alter column user_id type varchar(36);
        end if;

        -- verification_records.user_id
        if exists (select 1 from information_schema.columns where table_name = 'verification_records' and column_name = 'user_id') then
          alter table verification_records alter column user_id type varchar(36);
        end if;

        -- personal_access_tokens.user_id
        if exists (select 1 from information_schema.columns where table_name = 'personal_access_tokens' and column_name = 'user_id') then
          alter table personal_access_tokens alter column user_id type varchar(36);
        end if;

        -- sentinel_activities.target_user_id
        if exists (select 1 from information_schema.columns where table_name = 'sentinel_activities' and column_name = 'target_user_id') then
          alter table sentinel_activities alter column target_user_id type varchar(36);
        end if;

        -- application_user_consent_organizations.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organizations' and column_name = 'user_id') then
          alter table application_user_consent_organizations alter column user_id type varchar(36);
        end if;

        -- application_user_consent_organization_scopes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_scopes' and column_name = 'user_id') then
          alter table application_user_consent_organization_scopes alter column user_id type varchar(36);
        end if;

        -- application_user_consent_organization_resource_scopes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_resource_scopes' and column_name = 'user_id') then
          alter table application_user_consent_organization_resource_scopes alter column user_id type varchar(36);
        end if;

        -- application_user_consent_user_scopes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_user_scopes' and column_name = 'user_id') then
          alter table application_user_consent_user_scopes alter column user_id type varchar(36);
        end if;

        -- application_user_consent_resource_scopes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_resource_scopes' and column_name = 'user_id') then
          alter table application_user_consent_resource_scopes alter column user_id type varchar(36);
        end if;

        -- organization_role_user_relations.user_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_user_relations' and column_name = 'user_id') then
          alter table organization_role_user_relations alter column user_id type varchar(36);
        end if;

        -- daily_active_users.user_id
        if exists (select 1 from information_schema.columns where table_name = 'daily_active_users' and column_name = 'user_id') then
          alter table daily_active_users alter column user_id type varchar(36);
        end if;

        -- secrets.user_id
        if exists (select 1 from information_schema.columns where table_name = 'secrets' and column_name = 'user_id') then
          alter table secrets alter column user_id type varchar(36);
        end if;

        -- subject_tokens.user_id
        if exists (select 1 from information_schema.columns where table_name = 'subject_tokens' and column_name = 'user_id') then
          alter table subject_tokens alter column user_id type varchar(36);
        end if;
      end $$;
    `);
  },
  down: async (pool) => {
    // Revert all user_id foreign key columns
    await pool.query(sql`
      do $$
      begin
        -- subject_tokens.user_id
        if exists (select 1 from information_schema.columns where table_name = 'subject_tokens' and column_name = 'user_id') then
          alter table subject_tokens alter column user_id type varchar(12);
        end if;

        -- secrets.user_id
        if exists (select 1 from information_schema.columns where table_name = 'secrets' and column_name = 'user_id') then
          alter table secrets alter column user_id type varchar(12);
        end if;

        -- daily_active_users.user_id
        if exists (select 1 from information_schema.columns where table_name = 'daily_active_users' and column_name = 'user_id') then
          alter table daily_active_users alter column user_id type varchar(12);
        end if;

        -- organization_role_user_relations.user_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_user_relations' and column_name = 'user_id') then
          alter table organization_role_user_relations alter column user_id type varchar(12);
        end if;

        -- application_user_consent_resource_scopes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_resource_scopes' and column_name = 'user_id') then
          alter table application_user_consent_resource_scopes alter column user_id type varchar(12);
        end if;

        -- application_user_consent_user_scopes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_user_scopes' and column_name = 'user_id') then
          alter table application_user_consent_user_scopes alter column user_id type varchar(12);
        end if;

        -- application_user_consent_organization_resource_scopes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_resource_scopes' and column_name = 'user_id') then
          alter table application_user_consent_organization_resource_scopes alter column user_id type varchar(12);
        end if;

        -- application_user_consent_organization_scopes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_scopes' and column_name = 'user_id') then
          alter table application_user_consent_organization_scopes alter column user_id type varchar(12);
        end if;

        -- application_user_consent_organizations.user_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organizations' and column_name = 'user_id') then
          alter table application_user_consent_organizations alter column user_id type varchar(12);
        end if;

        -- sentinel_activities.target_user_id
        if exists (select 1 from information_schema.columns where table_name = 'sentinel_activities' and column_name = 'target_user_id') then
          alter table sentinel_activities alter column target_user_id type varchar(12);
        end if;

        -- personal_access_tokens.user_id
        if exists (select 1 from information_schema.columns where table_name = 'personal_access_tokens' and column_name = 'user_id') then
          alter table personal_access_tokens alter column user_id type varchar(12);
        end if;

        -- verification_records.user_id
        if exists (select 1 from information_schema.columns where table_name = 'verification_records' and column_name = 'user_id') then
          alter table verification_records alter column user_id type varchar(12);
        end if;

        -- verification_statuses.user_id
        if exists (select 1 from information_schema.columns where table_name = 'verification_statuses' and column_name = 'user_id') then
          alter table verification_statuses alter column user_id type varchar(12);
        end if;

        -- logs.user_id
        if exists (select 1 from information_schema.columns where table_name = 'logs' and column_name = 'user_id') then
          alter table logs alter column user_id type varchar(12);
        end if;

        -- passcodes.user_id
        if exists (select 1 from information_schema.columns where table_name = 'passcodes' and column_name = 'user_id') then
          alter table passcodes alter column user_id type varchar(12);
        end if;

        -- user_sso_identities.user_id
        if exists (select 1 from information_schema.columns where table_name = 'user_sso_identities' and column_name = 'user_id') then
          alter table user_sso_identities alter column user_id type varchar(12);
        end if;

        -- organization_user_relations.user_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_user_relations' and column_name = 'user_id') then
          alter table organization_user_relations alter column user_id type varchar(12);
        end if;

        -- users_roles.user_id
        if exists (select 1 from information_schema.columns where table_name = 'users_roles' and column_name = 'user_id') then
          alter table users_roles alter column user_id type varchar(12);
        end if;
      end $$;
    `);
  },
};

export default alteration;
