import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/**
 * `alter column ... type` deletes the planner statistics of every altered column, and
 * autovacuum does not restore them promptly. Analyze every widened table, the hottest first,
 * right after the widening alteration so query plans do not degrade in the meantime.
 */
const tables = [
  'logs',
  'oidc_model_instances',
  'users',
  'service_logs',
  'tenants',
  'account_centers',
  'aggregated_daily_active_users',
  'application_access_control_org_role_relations',
  'application_access_control_organization_relations',
  'application_access_control_user_relations',
  'application_access_control_user_role_relations',
  'application_secrets',
  'application_sign_in_experiences',
  'application_user_consent_organization_resource_scopes',
  'application_user_consent_organization_scopes',
  'application_user_consent_organizations',
  'application_user_consent_resource_scopes',
  'application_user_consent_user_scopes',
  'applications',
  'applications_roles',
  'captcha_providers',
  'cimd_grant_client_snapshots',
  'cimd_grant_organizations',
  'cimd_organization_resource_scopes',
  'cimd_organization_scopes',
  'cimd_resource_scopes',
  'cimd_user_scopes',
  'connectors',
  'custom_phrases',
  'custom_profile_fields',
  'daily_active_users',
  'daily_token_usage',
  'domains',
  'email_templates',
  'hooks',
  'idp_initiated_saml_sso_sessions',
  'logto_configs',
  'oidc_session_extensions',
  'one_time_tokens',
  'organization_application_relations',
  'organization_invitation_role_relations',
  'organization_invitations',
  'organization_jit_email_domains',
  'organization_jit_roles',
  'organization_jit_sso_connectors',
  'organization_role_application_relations',
  'organization_role_resource_scope_relations',
  'organization_role_scope_relations',
  'organization_role_user_relations',
  'organization_roles',
  'organization_scopes',
  'organization_user_relations',
  'organizations',
  'passcodes',
  'personal_access_tokens',
  'resources',
  'roles',
  'roles_scopes',
  'saml_application_configs',
  'saml_application_secrets',
  'saml_application_sessions',
  'saml_sso_connector_signing_keys',
  'scopes',
  'secret_enterprise_sso_connector_relations',
  'secret_social_connector_relations',
  'secrets',
  'sentinel_activities',
  'sign_in_experiences',
  'sso_connector_idp_initiated_auth_configs',
  'sso_connectors',
  'subject_tokens',
  'trusted_devices',
  'user_geo_locations',
  'user_sign_in_countries',
  'user_sso_identities',
  'users_roles',
  'verification_records',
  'verification_statuses',
];

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      for (const table of tables) {
        // eslint-disable-next-line no-await-in-loop -- analyze sequentially, hottest first
        await connection.query(sql`analyze ${sql.identifier([table])};`);
      }
    });
  },
  up: async () => {
    /** Statistics collection runs outside the transaction. */
  },
  down: async () => {
    /** Statistics are not reverted. */
  },
};

export default alteration;
