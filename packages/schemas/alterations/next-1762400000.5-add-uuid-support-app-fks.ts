import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Add UUID support - Part 5: Foreign key tables with application_id
 *
 * This migration expands application_id foreign key columns to support UUID v7 (36 characters).
 * Uses conditional logic to handle different database versions.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    // Alter all tables with application_id foreign keys (conditionally)
    await pool.query(sql`
      do $$
      begin
        -- application_secrets.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_secrets' and column_name = 'application_id') then
          alter table application_secrets alter column application_id type varchar(36);
        end if;

        -- application_sign_in_experiences.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_sign_in_experiences' and column_name = 'application_id') then
          alter table application_sign_in_experiences alter column application_id type varchar(36);
        end if;

        -- applications_roles.application_id
        if exists (select 1 from information_schema.columns where table_name = 'applications_roles' and column_name = 'application_id') then
          alter table applications_roles alter column application_id type varchar(36);
        end if;

        -- application_user_consent_organization_resource_scopes.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_resource_scopes' and column_name = 'application_id') then
          alter table application_user_consent_organization_resource_scopes alter column application_id type varchar(36);
        end if;

        -- application_user_consent_organization_scopes.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_scopes' and column_name = 'application_id') then
          alter table application_user_consent_organization_scopes alter column application_id type varchar(36);
        end if;

        -- application_user_consent_organizations.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organizations' and column_name = 'application_id') then
          alter table application_user_consent_organizations alter column application_id type varchar(36);
        end if;

        -- application_user_consent_resource_scopes.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_resource_scopes' and column_name = 'application_id') then
          alter table application_user_consent_resource_scopes alter column application_id type varchar(36);
        end if;

        -- application_user_consent_user_scopes.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_user_scopes' and column_name = 'application_id') then
          alter table application_user_consent_user_scopes alter column application_id type varchar(36);
        end if;

        -- organization_application_relations.application_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_application_relations' and column_name = 'application_id') then
          alter table organization_application_relations alter column application_id type varchar(36);
        end if;

        -- organization_role_application_relations.application_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_application_relations' and column_name = 'application_id') then
          alter table organization_role_application_relations alter column application_id type varchar(36);
        end if;

        -- saml_application_configs.application_id
        if exists (select 1 from information_schema.columns where table_name = 'saml_application_configs' and column_name = 'application_id') then
          alter table saml_application_configs alter column application_id type varchar(36);
        end if;

        -- saml_application_secrets.application_id
        if exists (select 1 from information_schema.columns where table_name = 'saml_application_secrets' and column_name = 'application_id') then
          alter table saml_application_secrets alter column application_id type varchar(36);
        end if;

        -- saml_application_sessions.application_id
        if exists (select 1 from information_schema.columns where table_name = 'saml_application_sessions' and column_name = 'application_id') then
          alter table saml_application_sessions alter column application_id type varchar(36);
        end if;

        -- sso_connector_idp_initiated_auth_configs.default_application_id
        if exists (select 1 from information_schema.columns where table_name = 'sso_connector_idp_initiated_auth_configs' and column_name = 'default_application_id') then
          alter table sso_connector_idp_initiated_auth_configs alter column default_application_id type varchar(36);
        end if;

        -- users.application_id
        if exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'application_id') then
          alter table users alter column application_id type varchar(36);
        end if;
      end $$;
    `);
  },
  down: async (pool) => {
    // Revert application_id foreign key columns
    await pool.query(sql`
      do $$
      begin
        -- users.application_id
        if exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'application_id') then
          alter table users alter column application_id type varchar(21);
        end if;

        -- sso_connector_idp_initiated_auth_configs.default_application_id
        if exists (select 1 from information_schema.columns where table_name = 'sso_connector_idp_initiated_auth_configs' and column_name = 'default_application_id') then
          alter table sso_connector_idp_initiated_auth_configs alter column default_application_id type varchar(21);
        end if;

        -- saml_application_sessions.application_id
        if exists (select 1 from information_schema.columns where table_name = 'saml_application_sessions' and column_name = 'application_id') then
          alter table saml_application_sessions alter column application_id type varchar(21);
        end if;

        -- saml_application_secrets.application_id
        if exists (select 1 from information_schema.columns where table_name = 'saml_application_secrets' and column_name = 'application_id') then
          alter table saml_application_secrets alter column application_id type varchar(21);
        end if;

        -- saml_application_configs.application_id
        if exists (select 1 from information_schema.columns where table_name = 'saml_application_configs' and column_name = 'application_id') then
          alter table saml_application_configs alter column application_id type varchar(21);
        end if;

        -- organization_role_application_relations.application_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_application_relations' and column_name = 'application_id') then
          alter table organization_role_application_relations alter column application_id type varchar(21);
        end if;

        -- organization_application_relations.application_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_application_relations' and column_name = 'application_id') then
          alter table organization_application_relations alter column application_id type varchar(21);
        end if;

        -- application_user_consent_user_scopes.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_user_scopes' and column_name = 'application_id') then
          alter table application_user_consent_user_scopes alter column application_id type varchar(21);
        end if;

        -- application_user_consent_resource_scopes.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_resource_scopes' and column_name = 'application_id') then
          alter table application_user_consent_resource_scopes alter column application_id type varchar(21);
        end if;

        -- application_user_consent_organizations.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organizations' and column_name = 'application_id') then
          alter table application_user_consent_organizations alter column application_id type varchar(21);
        end if;

        -- application_user_consent_organization_scopes.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_scopes' and column_name = 'application_id') then
          alter table application_user_consent_organization_scopes alter column application_id type varchar(21);
        end if;

        -- application_user_consent_organization_resource_scopes.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_resource_scopes' and column_name = 'application_id') then
          alter table application_user_consent_organization_resource_scopes alter column application_id type varchar(21);
        end if;

        -- applications_roles.application_id
        if exists (select 1 from information_schema.columns where table_name = 'applications_roles' and column_name = 'application_id') then
          alter table applications_roles alter column application_id type varchar(21);
        end if;

        -- application_sign_in_experiences.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_sign_in_experiences' and column_name = 'application_id') then
          alter table application_sign_in_experiences alter column application_id type varchar(21);
        end if;

        -- application_secrets.application_id
        if exists (select 1 from information_schema.columns where table_name = 'application_secrets' and column_name = 'application_id') then
          alter table application_secrets alter column application_id type varchar(21);
        end if;
      end $$;
    `);
  },
};

export default alteration;
