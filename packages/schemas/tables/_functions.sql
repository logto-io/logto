/* init_order = 0.5 */

create function set_tenant_id() returns trigger as
$$ begin
  select tenants.id into new.tenant_id
      from tenants
      where ('tenant_user_' || tenants.id) = current_user;

  if new.tenant_id is null then
      new.tenant_id := 'default';
  end if;

  return new;
end; $$ language plpgsql;

/* no_after_each */
