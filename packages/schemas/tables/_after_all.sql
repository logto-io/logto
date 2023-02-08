/* This SQL will run after all other queries. */

grant select, insert, update, delete
  on all tables
  in schema public
  to logto_tenant_${database};

revoke all privileges
  on table tenants
  from logto_tenant_${database};

revoke all privileges
  on table systems
  from logto_tenant_${database};
