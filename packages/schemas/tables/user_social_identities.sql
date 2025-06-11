/* init_order = 2 */

create table user_social_identities {
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id: varchar(21) not null,
  user_id: varchar(12) not null references users (id) on update cascade on delete cascade,
  /** Unique social provider identifier. E.g., 'google', 'facebook', etc. */
  target: varchar(256) not null,
  /** Provider user identity id */
  identity_id: varchar(256) not null,
  /** Unlike SSO identities, we will not clear the social identity when the original connector is deleted.
   * This is because social identities are often used for login, and we want to keep them even if the connector is removed.
   * The connector_id field will be set to null in this case, but the identity will remain in the database.
   * Once new social connector with the same target is created, the identity will be linked to it.
   */
  connector_id varchar(128)
    references connectors (id) on update cascade on delete set null,
  detail: jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  /** This field can not be used as the initial user identity creation date, as the data may be migrated from the legacy `users.identities` field, and we did not store the creation date there. */
  created_at: timestamptz not null default(now()),
  updated_at: timestamptz not null default(now()),
  primary key (id),
  constraint user_social_identities__target__identity_id
    unique (tenant_id, target, identity_id)
}



create trigger set_updated_at
  before update on user_social_identities
  for each row
  execute procedure set_updated_at();
