/* This SQL will run before all other queries. */

create role logto_tenant_${database} password '${password}' noinherit;

GRANT USAGE ON SCHEMA logto TO logto_tenant_${database};
ALTER ROLE logto_tenant_${database} SET search_path = logto, logto, "$user";