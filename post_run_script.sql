show search_path;
alter database postgres set search_path = alp, logto, "$user";
alter role postgres set search_path = alp, logto, "$user";
create schema logto;


GRANT USAGE ON SCHEMA logto TO logto_tenant_postgres_admin;
ALTER ROLE logto_tenant_postgres_admin SET search_path = logto, logto, "$user";

---- Grant CRUD access to the group ----
grant select, insert, update, delete
  on all tables
  in schema logto
  to logto_tenant_postgres_admin;

---- Security policies for tenants table ----

-- revoke all privileges
--  on table tenants
--  from logto_tenant_postgres_admin;

-- Allow limited select to perform the RLS policy query in `after_each` (using select ... from tenants ...)
-- grant select (id, db_user, is_suspended)
--  on table tenants
--  to logto_tenant_postgres_admin;

---- Revoke all privileges on systems table for tenant roles ----
-- revoke all privileges
--  on table systems
--  from logto_tenant_postgres_admin;

---- Revoke all privileges on service_logs table for tenant roles ----
-- revoke all privileges
--  on table service_logs
--  from logto_tenant_postgres_admin;


GRANT USAGE ON SCHEMA logto TO logto_tenant_postgres_default;
ALTER ROLE logto_tenant_postgres_default SET search_path = logto, logto, "$user";

---- Grant CRUD access to the group ----
grant select, insert, update, delete
  on all tables
  in schema logto
  to logto_tenant_postgres_default;

---- Security policies for tenants table ----

-- revoke all privileges
--   on table tenants
--   from logto_tenant_${database}_default;

-- -- Allow limited select to perform the RLS policy query in `after_each` (using select ... from tenants ...)
-- grant select (id, db_user, is_suspended)
--   on table tenants
--   to logto_tenant_${database}_default;

-- ---- Revoke all privileges on systems table for tenant roles ----
-- revoke all privileges
--   on table systems
--   from logto_tenant_${database}_default;

-- ---- Revoke all privileges on service_logs table for tenant roles ----
-- revoke all privileges
--   on table service_logs
--   from logto_tenant_${database}_default;