import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Add UUID support - Part 4: Foreign key tables with organization_id, role_id, and organization_role_id
 *
 * This migration expands foreign key columns to support UUID v7 (36 characters).
 * Uses conditional logic to handle different database versions.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    // Alter all tables with organization_id, role_id, and organization_role_id foreign keys (conditionally)
    await pool.query(sql`
      do $$
      begin
        -- organization_user_relations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_user_relations' and column_name = 'organization_id') then
          alter table organization_user_relations alter column organization_id type varchar(36);
        end if;

        -- organization_roles.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_roles' and column_name = 'organization_id') then
          alter table organization_roles alter column organization_id type varchar(36);
        end if;

        -- organization_scopes.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_scopes' and column_name = 'organization_id') then
          alter table organization_scopes alter column organization_id type varchar(36);
        end if;

        -- organization_invitations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_invitations' and column_name = 'organization_id') then
          alter table organization_invitations alter column organization_id type varchar(36);
        end if;

        -- organization_jit_roles.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_jit_roles' and column_name = 'organization_id') then
          alter table organization_jit_roles alter column organization_id type varchar(36);
        end if;

        -- organization_jit_email_domains.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_jit_email_domains' and column_name = 'organization_id') then
          alter table organization_jit_email_domains alter column organization_id type varchar(36);
        end if;

        -- organization_jit_sso_connectors.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_jit_sso_connectors' and column_name = 'organization_id') then
          alter table organization_jit_sso_connectors alter column organization_id type varchar(36);
        end if;

        -- organization_application_relations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_application_relations' and column_name = 'organization_id') then
          alter table organization_application_relations alter column organization_id type varchar(36);
        end if;

        -- application_user_consent_organizations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organizations' and column_name = 'organization_id') then
          alter table application_user_consent_organizations alter column organization_id type varchar(36);
        end if;

        -- application_user_consent_organization_scopes.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_scopes' and column_name = 'organization_id') then
          alter table application_user_consent_organization_scopes alter column organization_id type varchar(36);
        end if;

        -- application_user_consent_organization_resource_scopes.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_resource_scopes' and column_name = 'organization_id') then
          alter table application_user_consent_organization_resource_scopes alter column organization_id type varchar(36);
        end if;

        -- organization_role_user_relations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_user_relations' and column_name = 'organization_id') then
          alter table organization_role_user_relations alter column organization_id type varchar(36);
        end if;

        -- organization_role_application_relations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_application_relations' and column_name = 'organization_id') then
          alter table organization_role_application_relations alter column organization_id type varchar(36);
        end if;

        -- users_roles.role_id
        if exists (select 1 from information_schema.columns where table_name = 'users_roles' and column_name = 'role_id') then
          alter table users_roles alter column role_id type varchar(36);
        end if;

        -- roles_scopes.role_id
        if exists (select 1 from information_schema.columns where table_name = 'roles_scopes' and column_name = 'role_id') then
          alter table roles_scopes alter column role_id type varchar(36);
        end if;

        -- applications_roles.role_id
        if exists (select 1 from information_schema.columns where table_name = 'applications_roles' and column_name = 'role_id') then
          alter table applications_roles alter column role_id type varchar(36);
        end if;

        -- organization_invitation_role_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_invitation_role_relations' and column_name = 'organization_role_id') then
          alter table organization_invitation_role_relations alter column organization_role_id type varchar(36);
        end if;

        -- organization_role_user_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_user_relations' and column_name = 'organization_role_id') then
          alter table organization_role_user_relations alter column organization_role_id type varchar(36);
        end if;

        -- organization_role_scope_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_scope_relations' and column_name = 'organization_role_id') then
          alter table organization_role_scope_relations alter column organization_role_id type varchar(36);
        end if;

        -- organization_role_resource_scope_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_resource_scope_relations' and column_name = 'organization_role_id') then
          alter table organization_role_resource_scope_relations alter column organization_role_id type varchar(36);
        end if;

        -- organization_role_application_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_application_relations' and column_name = 'organization_role_id') then
          alter table organization_role_application_relations alter column organization_role_id type varchar(36);
        end if;

        -- organization_jit_roles.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_jit_roles' and column_name = 'organization_role_id') then
          alter table organization_jit_roles alter column organization_role_id type varchar(36);
        end if;
      end $$;
    `);
  },
  down: async (pool) => {
    // Revert organization_id, role_id, and organization_role_id foreign key columns
    await pool.query(sql`
      do $$
      begin
        -- organization_jit_roles.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_jit_roles' and column_name = 'organization_role_id') then
          alter table organization_jit_roles alter column organization_role_id type varchar(21);
        end if;

        -- organization_role_application_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_application_relations' and column_name = 'organization_role_id') then
          alter table organization_role_application_relations alter column organization_role_id type varchar(21);
        end if;

        -- organization_role_resource_scope_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_resource_scope_relations' and column_name = 'organization_role_id') then
          alter table organization_role_resource_scope_relations alter column organization_role_id type varchar(21);
        end if;

        -- organization_role_scope_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_scope_relations' and column_name = 'organization_role_id') then
          alter table organization_role_scope_relations alter column organization_role_id type varchar(21);
        end if;

        -- organization_role_user_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_user_relations' and column_name = 'organization_role_id') then
          alter table organization_role_user_relations alter column organization_role_id type varchar(21);
        end if;

        -- organization_invitation_role_relations.organization_role_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_invitation_role_relations' and column_name = 'organization_role_id') then
          alter table organization_invitation_role_relations alter column organization_role_id type varchar(21);
        end if;

        -- applications_roles.role_id
        if exists (select 1 from information_schema.columns where table_name = 'applications_roles' and column_name = 'role_id') then
          alter table applications_roles alter column role_id type varchar(21);
        end if;

        -- roles_scopes.role_id
        if exists (select 1 from information_schema.columns where table_name = 'roles_scopes' and column_name = 'role_id') then
          alter table roles_scopes alter column role_id type varchar(21);
        end if;

        -- users_roles.role_id
        if exists (select 1 from information_schema.columns where table_name = 'users_roles' and column_name = 'role_id') then
          alter table users_roles alter column role_id type varchar(21);
        end if;

        -- organization_role_application_relations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_application_relations' and column_name = 'organization_id') then
          alter table organization_role_application_relations alter column organization_id type varchar(21);
        end if;

        -- organization_role_user_relations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_role_user_relations' and column_name = 'organization_id') then
          alter table organization_role_user_relations alter column organization_id type varchar(21);
        end if;

        -- application_user_consent_organization_resource_scopes.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_resource_scopes' and column_name = 'organization_id') then
          alter table application_user_consent_organization_resource_scopes alter column organization_id type varchar(21);
        end if;

        -- application_user_consent_organization_scopes.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organization_scopes' and column_name = 'organization_id') then
          alter table application_user_consent_organization_scopes alter column organization_id type varchar(21);
        end if;

        -- application_user_consent_organizations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'application_user_consent_organizations' and column_name = 'organization_id') then
          alter table application_user_consent_organizations alter column organization_id type varchar(21);
        end if;

        -- organization_application_relations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_application_relations' and column_name = 'organization_id') then
          alter table organization_application_relations alter column organization_id type varchar(21);
        end if;

        -- organization_jit_sso_connectors.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_jit_sso_connectors' and column_name = 'organization_id') then
          alter table organization_jit_sso_connectors alter column organization_id type varchar(21);
        end if;

        -- organization_jit_email_domains.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_jit_email_domains' and column_name = 'organization_id') then
          alter table organization_jit_email_domains alter column organization_id type varchar(21);
        end if;

        -- organization_jit_roles.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_jit_roles' and column_name = 'organization_id') then
          alter table organization_jit_roles alter column organization_id type varchar(21);
        end if;

        -- organization_invitations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_invitations' and column_name = 'organization_id') then
          alter table organization_invitations alter column organization_id type varchar(21);
        end if;

        -- organization_scopes.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_scopes' and column_name = 'organization_id') then
          alter table organization_scopes alter column organization_id type varchar(21);
        end if;

        -- organization_roles.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_roles' and column_name = 'organization_id') then
          alter table organization_roles alter column organization_id type varchar(21);
        end if;

        -- organization_user_relations.organization_id
        if exists (select 1 from information_schema.columns where table_name = 'organization_user_relations' and column_name = 'organization_id') then
          alter table organization_user_relations alter column organization_id type varchar(21);
        end if;
      end $$;
    `);
  },
};

export default alteration;
