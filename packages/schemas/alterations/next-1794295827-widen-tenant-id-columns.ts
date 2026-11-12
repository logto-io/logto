/* eslint-disable max-lines -- single-transaction migration script; the bulk is one SQL block */
import {
  sql,
  StatementCancelledError,
  type DatabaseTransactionConnection,
} from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Widen `tenants.id` and every column that stores a tenant ID or an ID derived from
 * one (118 columns across 78 tables) to varchar(64).
 * `subject_tokens.creator_id` widens from varchar(32) and narrows back to varchar(32).
 *
 * The widening itself is a catalog-only typmod change, but `tenants.id` is referenced by every
 * restrictive row-level-security policy, and several partial/expression indexes and check
 * constraints depend on the altered columns, so a naive `alter` either fails outright or
 * rebuilds large indexes for tens of seconds under exclusive locks. This script instead:
 *
 * 1. Acquires every table lock in one statement, bounded by an 800ms statement timeout armed
 *    inside a savepoint (a failed attempt releases everything), with jittered server-side
 *    sleeps between attempts.
 * 2. Runs all DDL as one `do` block under a single statement budget (default 10s; override
 *    with the `TENANT_ID_WIDENING_STATEMENT_BUDGET` environment variable, e.g. `15s`): drops
 *    the 19 large partial/expression indexes (follow-up releases restore the eleven live
 *    ones concurrently; the eight RLS-dead expression indexes are removed for good), swaps the restrictive policies around the `alter` statements, re-adds the
 *    9 dependent check constraints as `not valid` (validated by a follow-up alteration), and
 *    finally lowers the statement timeout to 1s for the trailing bookkeeping statements.
 *
 * Recovery: cancelling the running backend rolls everything back and releases all locks
 * (during the lock-acquisition phase a cancel is retried like a timeout - terminate to stop); an
 * idle-in-transaction session must be terminated instead; an interrupt during commit leaves an
 * uncertain outcome - inspect the alteration state and column widths before retrying.
 *
 * The `down` direction rewrites every table heap and fails if any stored value exceeds 21
 * characters. Never run it against Logto Cloud production; restore from a backup instead.
 */

// Whole seconds only: sub-second values would guarantee the DDL block aborts.
const statementBudget = process.env.TENANT_ID_WIDENING_STATEMENT_BUDGET ?? '10s';

if (!/^[1-9]\d*s$/.test(statementBudget)) {
  throw new Error(`Invalid TENANT_ID_WIDENING_STATEMENT_BUDGET value: ${statementBudget}`);
}

const maxLockAttempts = 10;

const tryAcquireTableLocks = async (connection: DatabaseTransactionConnection) => {
  /* eslint-disable no-await-in-loop -- bounded lock attempts must run sequentially */
  for (const attempt of Array.from({ length: maxLockAttempts }).keys()) {
    // Quiet check: do not even attempt while another backend holds a lock that an
    // access-exclusive request cannot outwait within the 800ms bound.
    const blockers = await connection.any(sql`
      select 1
      from pg_locks locks
      join pg_class classes on classes.oid = locks.relation
      where locks.locktype = 'relation'
        and locks.granted
        and locks.pid <> pg_backend_pid()
        and classes.relnamespace = 'public'::regnamespace
        and classes.relkind = 'r'
        and locks.mode in (
          'ShareUpdateExclusiveLock',
          'ShareLock',
          'ShareRowExclusiveLock',
          'ExclusiveLock',
          'AccessExclusiveLock'
        )
      limit 1
    `);

    if (blockers.length === 0) {
      try {
        await connection.transaction(async (savepoint) => {
          // Scoped to this savepoint: its rollback restores the previous timeout, so the
          // backoff sleep below is not cut short. A statement timeout (not `lock_timeout`)
          // bounds the whole multi-table lock statement.
          await savepoint.query(sql`set local statement_timeout = '800ms'`);
          await savepoint.query(sql`
            lock table
              tenants, account_centers, aggregated_daily_active_users,
              application_access_control_org_role_relations,
              application_access_control_organization_relations,
              application_access_control_user_relations,
              application_access_control_user_role_relations, application_secrets,
              application_sign_in_experiences, application_user_consent_organization_resource_scopes,
              application_user_consent_organization_scopes, application_user_consent_organizations,
              application_user_consent_resource_scopes, application_user_consent_user_scopes,
              applications, applications_roles, captcha_providers, cimd_grant_client_snapshots,
              cimd_grant_organizations, cimd_organization_resource_scopes, cimd_organization_scopes,
              cimd_resource_scopes, cimd_user_scopes, connectors, custom_phrases, custom_profile_fields,
              daily_active_users, daily_token_usage, domains, email_templates, hooks,
              idp_initiated_saml_sso_sessions, logs, logto_configs, oidc_model_instances,
              oidc_session_extensions, one_time_tokens, organization_application_relations,
              organization_invitation_role_relations, organization_invitations,
              organization_jit_email_domains, organization_jit_roles, organization_jit_sso_connectors,
              organization_role_application_relations, organization_role_resource_scope_relations,
              organization_role_scope_relations, organization_role_user_relations, organization_roles,
              organization_scopes, organization_user_relations, organizations, passcodes,
              personal_access_tokens, resources, roles, roles_scopes, saml_application_configs,
              saml_application_secrets, saml_application_sessions, saml_sso_connector_signing_keys,
              scopes, secret_enterprise_sso_connector_relations, secret_social_connector_relations,
              secrets, sentinel_activities, service_logs, sign_in_experiences,
              sso_connector_idp_initiated_auth_configs, sso_connectors, subject_tokens, trusted_devices,
              user_geo_locations, user_sign_in_countries, user_sso_identities, users, users_roles,
              verification_records, verification_statuses
              in access exclusive mode
          `);
          // On release, this propagates to the parent transaction together with the 800ms
          // value it replaces, arming the DDL budget without another round trip under the locks.
          await savepoint.query(
            sql`select set_config('statement_timeout', ${statementBudget}, true)`
          );
        });
        return true;
      } catch (error: unknown) {
        // Slonik maps every 57014 (statement_timeout and operator cancels alike) to this error;
        // during the lock phase both are retried (see the header).
        if (!(error instanceof StatementCancelledError)) {
          throw error;
        }
      }
    }

    if (attempt < maxLockAttempts - 1) {
      await connection.query(sql`select pg_sleep(${1 + Math.random() * 2})`);
    }
  }
  /* eslint-enable no-await-in-loop */

  return false;
};

const alteration: AlterationScript = {
  up: async (connection) => {
    // Bounds client round-trip gaps while the transaction may hold locks. Server-side
    // `pg_sleep` keeps the session active during retry backoffs.
    await connection.query(sql`set local idle_in_transaction_session_timeout = '2s'`);

    const isLocked = await tryAcquireTableLocks(connection);

    if (!isLocked) {
      throw new Error(
        `Could not acquire the table locks after ${maxLockAttempts} bounded attempts. Another session holds conflicting locks (an autovacuum worker, a long transaction, or concurrent DDL); retry once the database is quiet.`
      );
    }

    await connection.query(sql`
      do $widen$
      declare
        _policy record;
        _count integer;
      begin
      -- The large partial/expression indexes: without dropping them first, the alters below
      -- would rebuild them here, under the exclusive locks. Follow-up releases restore the
      -- eleven live ones concurrently (the eight expression indexes are unusable under
      -- row-level security and stay removed); until then reads fall back to the plain
      -- tenant-prefixed indexes.
      drop index logs__application_id;
      drop index logs__hook_id;
      drop index logs__payload_application_id_created_at;
      drop index logs__payload_hook_id_created_at;
      drop index logs__payload_user_id_created_at;
      drop index logs__user_id;
      drop index oidc_model_instances__grant_payload_account_id_expires_at;
      drop index oidc_model_instances__model_name_payload_account_id_expires_at;
      drop index oidc_model_instances__model_name_payload_account_id_partial;
      drop index oidc_model_instances__model_name_payload_grant_id;
      drop index oidc_model_instances__model_name_payload_grant_id_partial;
      drop index oidc_model_instances__model_name_payload_uid;
      drop index oidc_model_instances__model_name_payload_user_code;
      drop index oidc_model_instances__session_payload_account_id_expires_at;
      drop index service_logs__email__tenant_id__created_at__id;
      drop index service_logs__email__tenant_id__recipient__created_at__id;
      drop index users__primary_email_lower;
      drop index users__tenant_lower_username;
      drop index users__username_lower;

      -- Every restrictive policy references tenants.id. Policy names can be truncated at 63
      -- bytes, so they are captured from the catalog, never reconstructed from table names.
      create temp table _widening_policies on commit drop as
        select policies.polname as policy_name, classes.relname as table_name,
          pg_get_expr(policies.polqual, policies.polrelid) as qual
        from pg_policy policies
        join pg_class classes on classes.oid = policies.polrelid
        where not policies.polpermissive
          and classes.relnamespace = 'public'::regnamespace;

      select count(*) into _count from _widening_policies;
      if _count <> 76 then
        raise exception 'tenant-id widening: found % restrictive policies on the public schema, expected 76. A custom or missing row-level-security policy must be reconciled first: compare pg_policy against a fresh install, remove or restore the unexpected policies, then deploy again.', _count;
      end if;

      -- The count guard cannot see a stock policy whose expression was customized in place;
      -- recreating it from the template would silently weaken it. All stock policies share one
      -- normalized expression, so any outlier is a customization.
      if (select count(distinct qual) from _widening_policies) <> 1 then
        raise exception 'tenant-id widening: the restrictive policies do not all share one definition; customized policies would be replaced with the stock template. Divergent tables: %. Restore the stock policies, deploy, then re-apply the customizations.', (
          select string_agg(table_name, ', ')
          from _widening_policies
          where qual <> (select qual from _widening_policies group by qual order by count(*) desc limit 1)
        );
      end if;

      for _policy in select * from _widening_policies loop
        execute format('drop policy %I on %I', _policy.policy_name, _policy.table_name);
      end loop;

      -- Check constraints referencing widened columns would be revalidated by a full table
      -- scan during the alter; they are re-added as not valid below and validated online
      -- by a follow-up alteration.
      alter table application_secrets drop constraint application_type;
      alter table application_access_control_user_role_relations drop constraint application_access_control_user_role_relations__role_type;
      alter table applications_roles drop constraint applications_roles__role_type;
      alter table organization_application_relations drop constraint application_type;
      alter table saml_application_configs drop constraint saml_application_configs__application_type;
      alter table saml_application_secrets drop constraint saml_application_secrets__application_type;
      alter table saml_application_sessions drop constraint saml_application_sessions__application_type;
      alter table sso_connector_idp_initiated_auth_configs drop constraint application_type;
      alter table users_roles drop constraint users_roles__role_type;

      -- The widening itself: catalog-only, no table data is rewritten.
      alter table tenants alter column id type varchar(64);
      alter table account_centers alter column tenant_id type varchar(64);
      alter table aggregated_daily_active_users alter column tenant_id type varchar(64);
      alter table application_access_control_org_role_relations alter column tenant_id type varchar(64), alter column application_id type varchar(64), alter column organization_id type varchar(64);
      alter table application_access_control_organization_relations alter column tenant_id type varchar(64), alter column application_id type varchar(64), alter column organization_id type varchar(64);
      alter table application_access_control_user_relations alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table application_access_control_user_role_relations alter column tenant_id type varchar(64), alter column application_id type varchar(64), alter column role_id type varchar(64);
      alter table application_secrets alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table application_sign_in_experiences alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table application_user_consent_organization_resource_scopes alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table application_user_consent_organization_scopes alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table application_user_consent_organizations alter column tenant_id type varchar(64), alter column application_id type varchar(64), alter column organization_id type varchar(64);
      alter table application_user_consent_resource_scopes alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table application_user_consent_user_scopes alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table applications alter column tenant_id type varchar(64), alter column id type varchar(64);
      alter table applications_roles alter column tenant_id type varchar(64), alter column application_id type varchar(64), alter column role_id type varchar(64);
      alter table captcha_providers alter column tenant_id type varchar(64);
      alter table cimd_grant_client_snapshots alter column tenant_id type varchar(64);
      alter table cimd_grant_organizations alter column tenant_id type varchar(64), alter column organization_id type varchar(64);
      alter table cimd_organization_resource_scopes alter column tenant_id type varchar(64);
      alter table cimd_organization_scopes alter column tenant_id type varchar(64);
      alter table cimd_resource_scopes alter column tenant_id type varchar(64);
      alter table cimd_user_scopes alter column tenant_id type varchar(64);
      alter table connectors alter column tenant_id type varchar(64);
      alter table custom_phrases alter column tenant_id type varchar(64);
      alter table custom_profile_fields alter column tenant_id type varchar(64);
      alter table daily_active_users alter column tenant_id type varchar(64);
      alter table daily_token_usage alter column tenant_id type varchar(64);
      alter table domains alter column tenant_id type varchar(64);
      alter table email_templates alter column tenant_id type varchar(64);
      alter table hooks alter column tenant_id type varchar(64);
      alter table idp_initiated_saml_sso_sessions alter column tenant_id type varchar(64);
      alter table logs alter column tenant_id type varchar(64);
      alter table logto_configs alter column tenant_id type varchar(64);
      alter table oidc_model_instances alter column tenant_id type varchar(64);
      alter table oidc_session_extensions alter column tenant_id type varchar(64), alter column client_id type varchar(64);
      alter table one_time_tokens alter column tenant_id type varchar(64);
      alter table organization_application_relations alter column tenant_id type varchar(64), alter column organization_id type varchar(64), alter column application_id type varchar(64);
      alter table organization_invitation_role_relations alter column tenant_id type varchar(64);
      alter table organization_invitations alter column tenant_id type varchar(64), alter column organization_id type varchar(64);
      alter table organization_jit_email_domains alter column tenant_id type varchar(64), alter column organization_id type varchar(64);
      alter table organization_jit_roles alter column tenant_id type varchar(64), alter column organization_id type varchar(64);
      alter table organization_jit_sso_connectors alter column tenant_id type varchar(64), alter column organization_id type varchar(64);
      alter table organization_role_application_relations alter column tenant_id type varchar(64), alter column organization_id type varchar(64), alter column application_id type varchar(64);
      alter table organization_role_resource_scope_relations alter column tenant_id type varchar(64);
      alter table organization_role_scope_relations alter column tenant_id type varchar(64);
      alter table organization_role_user_relations alter column tenant_id type varchar(64), alter column organization_id type varchar(64);
      alter table organization_roles alter column tenant_id type varchar(64);
      alter table organization_scopes alter column tenant_id type varchar(64);
      alter table organization_user_relations alter column tenant_id type varchar(64), alter column organization_id type varchar(64);
      alter table organizations alter column tenant_id type varchar(64), alter column id type varchar(64);
      alter table passcodes alter column tenant_id type varchar(64);
      alter table personal_access_tokens alter column tenant_id type varchar(64);
      alter table resources alter column tenant_id type varchar(64);
      alter table roles alter column tenant_id type varchar(64), alter column id type varchar(64);
      alter table roles_scopes alter column tenant_id type varchar(64), alter column role_id type varchar(64);
      alter table saml_application_configs alter column application_id type varchar(64), alter column tenant_id type varchar(64);
      alter table saml_application_secrets alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table saml_application_sessions alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table saml_sso_connector_signing_keys alter column tenant_id type varchar(64);
      alter table scopes alter column tenant_id type varchar(64);
      alter table secret_enterprise_sso_connector_relations alter column tenant_id type varchar(64);
      alter table secret_social_connector_relations alter column tenant_id type varchar(64);
      alter table secrets alter column tenant_id type varchar(64);
      alter table sentinel_activities alter column tenant_id type varchar(64);
      alter table service_logs alter column tenant_id type varchar(64);
      alter table sign_in_experiences alter column tenant_id type varchar(64);
      alter table sso_connector_idp_initiated_auth_configs alter column tenant_id type varchar(64), alter column default_application_id type varchar(64);
      alter table sso_connectors alter column tenant_id type varchar(64);
      alter table subject_tokens alter column tenant_id type varchar(64), alter column creator_id type varchar(64);
      alter table trusted_devices alter column tenant_id type varchar(64);
      alter table user_geo_locations alter column tenant_id type varchar(64);
      alter table user_sign_in_countries alter column tenant_id type varchar(64);
      alter table user_sso_identities alter column tenant_id type varchar(64);
      alter table users alter column tenant_id type varchar(64), alter column application_id type varchar(64);
      alter table users_roles alter column tenant_id type varchar(64), alter column role_id type varchar(64);
      alter table verification_records alter column tenant_id type varchar(64);
      alter table verification_statuses alter column tenant_id type varchar(64);

      for _policy in select * from _widening_policies loop
        execute format(
          'create policy %I on %I as restrictive using (tenant_id = (select id from tenants where db_user = current_user))',
          _policy.policy_name,
          _policy.table_name
        );
      end loop;

      alter table application_secrets add constraint application_type check (check_application_type(application_id, 'MachineToMachine', 'Traditional', 'Protected')) not valid;
      alter table application_access_control_user_role_relations add constraint application_access_control_user_role_relations__role_type check (public.check_role_type(role_id, 'User')) not valid;
      alter table applications_roles add constraint applications_roles__role_type check (public.check_role_type(role_id, 'MachineToMachine')) not valid;
      alter table organization_application_relations add constraint application_type check (check_application_type(application_id, 'MachineToMachine')) not valid;
      alter table saml_application_configs add constraint saml_application_configs__application_type check (check_application_type(application_id, 'SAML')) not valid;
      alter table saml_application_secrets add constraint saml_application_secrets__application_type check (check_application_type(application_id, 'SAML')) not valid;
      alter table saml_application_sessions add constraint saml_application_sessions__application_type check (check_application_type(application_id, 'SAML')) not valid;
      alter table sso_connector_idp_initiated_auth_configs add constraint application_type check (check_application_type(default_application_id, 'Traditional', 'SPA', 'SAML')) not valid;
      alter table users_roles add constraint users_roles__role_type check (public.check_role_type(role_id, 'User')) not valid;

      if (select atttypmod from pg_attribute where attrelid = 'tenants'::regclass and attname = 'id') <> 68 then
        raise exception 'tenant-id widening: tenants.id was not widened, aborting';
      end if;

      -- Bounds the runner's trailing alteration-state update; the transaction-scoped DDL
      -- budget would otherwise apply to it in full.
      perform set_config('statement_timeout', '1s', true);
      end $widen$;
    `);
  },
  down: async (connection) => {
    // Shrinking rewrites every heap and fails when any stored value exceeds 21 characters.
    // See the header: never run this against Logto Cloud production.
    // The heap rewrites can outlive the pool's configured statement timeout, and a running
    // statement's timer cannot be lifted from within, so disable it before the do block.
    await connection.query(sql`set local statement_timeout = 0`);

    await connection.query(sql`
      do $narrow$
      declare
        _policy record;
      begin
      create temp table _narrowing_policies on commit drop as
        select policies.polname as policy_name, classes.relname as table_name,
          pg_get_expr(policies.polqual, policies.polrelid) as qual
        from pg_policy policies
        join pg_class classes on classes.oid = policies.polrelid
        where not policies.polpermissive
          and classes.relnamespace = 'public'::regnamespace;


      -- The count guard cannot see a stock policy whose expression was customized in place;
      -- recreating it from the template would silently weaken it. All stock policies share one
      -- normalized expression, so any outlier is a customization.
      if (select count(distinct qual) from _narrowing_policies) <> 1 then
        raise exception 'tenant-id widening: the restrictive policies do not all share one definition; customized policies would be replaced with the stock template. Divergent tables: %. Restore the stock policies, deploy, then re-apply the customizations.', (
          select string_agg(table_name, ', ')
          from _narrowing_policies
          where qual <> (select qual from _narrowing_policies group by qual order by count(*) desc limit 1)
        );
      end if;

      for _policy in select * from _narrowing_policies loop
        execute format('drop policy %I on %I', _policy.policy_name, _policy.table_name);
      end loop;

      alter table application_secrets drop constraint application_type;
      alter table application_access_control_user_role_relations drop constraint application_access_control_user_role_relations__role_type;
      alter table applications_roles drop constraint applications_roles__role_type;
      alter table organization_application_relations drop constraint application_type;
      alter table saml_application_configs drop constraint saml_application_configs__application_type;
      alter table saml_application_secrets drop constraint saml_application_secrets__application_type;
      alter table saml_application_sessions drop constraint saml_application_sessions__application_type;
      alter table sso_connector_idp_initiated_auth_configs drop constraint application_type;
      alter table users_roles drop constraint users_roles__role_type;

      alter table tenants alter column id type varchar(21);
      alter table account_centers alter column tenant_id type varchar(21);
      alter table aggregated_daily_active_users alter column tenant_id type varchar(21);
      alter table application_access_control_org_role_relations alter column tenant_id type varchar(21), alter column application_id type varchar(21), alter column organization_id type varchar(21);
      alter table application_access_control_organization_relations alter column tenant_id type varchar(21), alter column application_id type varchar(21), alter column organization_id type varchar(21);
      alter table application_access_control_user_relations alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table application_access_control_user_role_relations alter column tenant_id type varchar(21), alter column application_id type varchar(21), alter column role_id type varchar(21);
      alter table application_secrets alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table application_sign_in_experiences alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table application_user_consent_organization_resource_scopes alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table application_user_consent_organization_scopes alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table application_user_consent_organizations alter column tenant_id type varchar(21), alter column application_id type varchar(21), alter column organization_id type varchar(21);
      alter table application_user_consent_resource_scopes alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table application_user_consent_user_scopes alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table applications alter column tenant_id type varchar(21), alter column id type varchar(21);
      alter table applications_roles alter column tenant_id type varchar(21), alter column application_id type varchar(21), alter column role_id type varchar(21);
      alter table captcha_providers alter column tenant_id type varchar(21);
      alter table cimd_grant_client_snapshots alter column tenant_id type varchar(21);
      alter table cimd_grant_organizations alter column tenant_id type varchar(21), alter column organization_id type varchar(21);
      alter table cimd_organization_resource_scopes alter column tenant_id type varchar(21);
      alter table cimd_organization_scopes alter column tenant_id type varchar(21);
      alter table cimd_resource_scopes alter column tenant_id type varchar(21);
      alter table cimd_user_scopes alter column tenant_id type varchar(21);
      alter table connectors alter column tenant_id type varchar(21);
      alter table custom_phrases alter column tenant_id type varchar(21);
      alter table custom_profile_fields alter column tenant_id type varchar(21);
      alter table daily_active_users alter column tenant_id type varchar(21);
      alter table daily_token_usage alter column tenant_id type varchar(21);
      alter table domains alter column tenant_id type varchar(21);
      alter table email_templates alter column tenant_id type varchar(21);
      alter table hooks alter column tenant_id type varchar(21);
      alter table idp_initiated_saml_sso_sessions alter column tenant_id type varchar(21);
      alter table logs alter column tenant_id type varchar(21);
      alter table logto_configs alter column tenant_id type varchar(21);
      alter table oidc_model_instances alter column tenant_id type varchar(21);
      alter table oidc_session_extensions alter column tenant_id type varchar(21), alter column client_id type varchar(21);
      alter table one_time_tokens alter column tenant_id type varchar(21);
      alter table organization_application_relations alter column tenant_id type varchar(21), alter column organization_id type varchar(21), alter column application_id type varchar(21);
      alter table organization_invitation_role_relations alter column tenant_id type varchar(21);
      alter table organization_invitations alter column tenant_id type varchar(21), alter column organization_id type varchar(21);
      alter table organization_jit_email_domains alter column tenant_id type varchar(21), alter column organization_id type varchar(21);
      alter table organization_jit_roles alter column tenant_id type varchar(21), alter column organization_id type varchar(21);
      alter table organization_jit_sso_connectors alter column tenant_id type varchar(21), alter column organization_id type varchar(21);
      alter table organization_role_application_relations alter column tenant_id type varchar(21), alter column organization_id type varchar(21), alter column application_id type varchar(21);
      alter table organization_role_resource_scope_relations alter column tenant_id type varchar(21);
      alter table organization_role_scope_relations alter column tenant_id type varchar(21);
      alter table organization_role_user_relations alter column tenant_id type varchar(21), alter column organization_id type varchar(21);
      alter table organization_roles alter column tenant_id type varchar(21);
      alter table organization_scopes alter column tenant_id type varchar(21);
      alter table organization_user_relations alter column tenant_id type varchar(21), alter column organization_id type varchar(21);
      alter table organizations alter column tenant_id type varchar(21), alter column id type varchar(21);
      alter table passcodes alter column tenant_id type varchar(21);
      alter table personal_access_tokens alter column tenant_id type varchar(21);
      alter table resources alter column tenant_id type varchar(21);
      alter table roles alter column tenant_id type varchar(21), alter column id type varchar(21);
      alter table roles_scopes alter column tenant_id type varchar(21), alter column role_id type varchar(21);
      alter table saml_application_configs alter column application_id type varchar(21), alter column tenant_id type varchar(21);
      alter table saml_application_secrets alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table saml_application_sessions alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table saml_sso_connector_signing_keys alter column tenant_id type varchar(21);
      alter table scopes alter column tenant_id type varchar(21);
      alter table secret_enterprise_sso_connector_relations alter column tenant_id type varchar(21);
      alter table secret_social_connector_relations alter column tenant_id type varchar(21);
      alter table secrets alter column tenant_id type varchar(21);
      alter table sentinel_activities alter column tenant_id type varchar(21);
      alter table service_logs alter column tenant_id type varchar(21);
      alter table sign_in_experiences alter column tenant_id type varchar(21);
      alter table sso_connector_idp_initiated_auth_configs alter column tenant_id type varchar(21), alter column default_application_id type varchar(21);
      alter table sso_connectors alter column tenant_id type varchar(21);
      alter table subject_tokens alter column tenant_id type varchar(21), alter column creator_id type varchar(32);
      alter table trusted_devices alter column tenant_id type varchar(21);
      alter table user_geo_locations alter column tenant_id type varchar(21);
      alter table user_sign_in_countries alter column tenant_id type varchar(21);
      alter table user_sso_identities alter column tenant_id type varchar(21);
      alter table users alter column tenant_id type varchar(21), alter column application_id type varchar(21);
      alter table users_roles alter column tenant_id type varchar(21), alter column role_id type varchar(21);
      alter table verification_records alter column tenant_id type varchar(21);
      alter table verification_statuses alter column tenant_id type varchar(21);

      for _policy in select * from _narrowing_policies loop
        execute format(
          'create policy %I on %I as restrictive using (tenant_id = (select id from tenants where db_user = current_user))',
          _policy.policy_name,
          _policy.table_name
        );
      end loop;

      alter table application_secrets add constraint application_type check (check_application_type(application_id, 'MachineToMachine', 'Traditional', 'Protected'));
      alter table application_access_control_user_role_relations add constraint application_access_control_user_role_relations__role_type check (public.check_role_type(role_id, 'User'));
      alter table applications_roles add constraint applications_roles__role_type check (public.check_role_type(role_id, 'MachineToMachine'));
      alter table organization_application_relations add constraint application_type check (check_application_type(application_id, 'MachineToMachine'));
      alter table saml_application_configs add constraint saml_application_configs__application_type check (check_application_type(application_id, 'SAML'));
      alter table saml_application_secrets add constraint saml_application_secrets__application_type check (check_application_type(application_id, 'SAML'));
      alter table saml_application_sessions add constraint saml_application_sessions__application_type check (check_application_type(application_id, 'SAML'));
      alter table sso_connector_idp_initiated_auth_configs add constraint application_type check (check_application_type(default_application_id, 'Traditional', 'SPA', 'SAML'));
      alter table users_roles add constraint users_roles__role_type check (public.check_role_type(role_id, 'User'));

      -- Restore the originals dropped by up (plain creates are acceptable in down); when the
      -- follow-up release is also installed, its down steps have already dropped its copies.
      create index logs__application_id
        on logs (tenant_id, (payload->>'applicationId'));
      create index logs__hook_id
        on logs (tenant_id, (payload->>'hookId'));
      create index logs__payload_application_id_created_at
        on logs (tenant_id, payload_application_id, created_at)
        where payload_application_id is not null;
      create index logs__payload_hook_id_created_at
        on logs (tenant_id, payload_hook_id, created_at)
        where payload_hook_id is not null;
      create index logs__payload_user_id_created_at
        on logs (tenant_id, payload_user_id, created_at)
        where payload_user_id is not null;
      create index logs__user_id
        on logs (tenant_id, (payload->>'userId'));
      create index oidc_model_instances__grant_payload_account_id_expires_at
        on oidc_model_instances (tenant_id, (payload->>'accountId'), expires_at)
        WHERE model_name = 'Grant';
      create index oidc_model_instances__model_name_payload_account_id_expires_at
        on oidc_model_instances (tenant_id, model_name, payload_account_id, expires_at)
        where payload_account_id is not null;
      create index oidc_model_instances__model_name_payload_account_id_partial
        on oidc_model_instances (tenant_id, model_name, (payload->>'accountId'))
        where payload ? 'accountId';
      create index oidc_model_instances__model_name_payload_grant_id
        on oidc_model_instances (tenant_id, model_name, payload_grant_id)
        where payload_grant_id is not null;
      create index oidc_model_instances__model_name_payload_grant_id_partial
        on oidc_model_instances (tenant_id, model_name, (payload->>'grantId'))
        where payload ? 'grantId';
      create index oidc_model_instances__model_name_payload_uid
        on oidc_model_instances (tenant_id, model_name, payload_uid)
        where payload_uid is not null;
      create index oidc_model_instances__model_name_payload_user_code
        on oidc_model_instances (tenant_id, model_name, payload_user_code)
        where payload_user_code is not null;
      create index oidc_model_instances__session_payload_account_id_expires_at
        on oidc_model_instances (tenant_id, (payload->>'accountId'), expires_at)
        WHERE model_name = 'Session';
      create index service_logs__email__tenant_id__created_at__id
        on service_logs (tenant_id, created_at desc, id desc)
        where type in ('sendEmail', 'sendEmailFailed');
      create index service_logs__email__tenant_id__recipient__created_at__id
        on service_logs (tenant_id, lower(payload->'data'->>'to'), created_at desc, id desc)
        where type in ('sendEmail', 'sendEmailFailed');
      create index users__primary_email_lower
        on users (tenant_id, primary_email_lower)
        where primary_email_lower is not null;
      create index users__tenant_lower_username
        on users (tenant_id, lower(username))
        where username is not null;
      create index users__username_lower
        on users (tenant_id, username_lower)
        where username_lower is not null;
      end $narrow$;
    `);
  },
};

export default alteration;

/* eslint-enable max-lines */
