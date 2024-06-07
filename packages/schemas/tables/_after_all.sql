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
grant select (id, db_user, is_suspended)
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

---- Revoke all privileges on service_logs table for tenant roles ----
revoke all privileges
  on table service_logs
  from logto_tenant_${database};
