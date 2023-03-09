/* This SQL will run after all other queries. */

---- Grant CRUD access to the group ----
grant select, insert, update, delete
  on all tables
  in schema public
  to logto_tenant_${database};

---- Security policies for tenants table ----

revoke all privileges
  on table tenants
  from logto_tenant_${database};

-- Allow limited select to perform the RLS policy query in `after_each` (using select ... from tenants ...)
grant select (id, db_user)
  on table tenants
  to logto_tenant_${database};

alter table tenants enable row level security;

-- Create RLS policy to minimize the privilege
create policy tenants_tenant_id on tenants
  using (db_user = current_user);

---- Revoke all privileges on systems table for tenant roles ----
revoke all privileges
  on table systems
  from logto_tenant_${database};

---- Create policies to make internal roles read-only ----

/**
 * Note:
 *
 * Internal roles have scope preset and they are read-only, but we do not
 * limit user or application assignment since it's business logic.
 */

-- Restrict direct role modification
create policy roles_select on roles
	for select using (true);

drop policy roles_modification on roles;
create policy roles_modification on roles
	using (not starts_with(name, '#internal:'));

-- Restrict role - scope modification
create policy roles_scopes_select on roles_scopes
	for select using (true);

drop policy roles_scopes_modification on roles_scopes;
create policy roles_scopes_modification on roles_scopes
  using (not starts_with((select roles.name from roles where roles.id = role_id), '#internal:'));

---- TODO: Make internal API Resources read-only ----
