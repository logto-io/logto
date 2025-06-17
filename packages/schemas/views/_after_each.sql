/* This SQL will run after all other queries. */

---- Grant CRUD access to the group ----
grant select, insert, update, delete
  on ${name}
  to logto_tenant_${database};
