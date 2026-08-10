/* init_order = 3 */

/**
  The organization authorized on a single OIDC Grant for a client ID metadata document (CIMD) client.
  CIMD clients are unregistered URL identities with no deletion lifecycle and transferable ownership,
  so organization access follows the single authorization instead of a long-lived cross-grant
  relation: rows cascade away with the Grant row and with the user's organization membership.
*/
create table cimd_grant_organizations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The ID of the Grant row in `oidc_model_instances`. */
  grant_id varchar(128) not null,
  /** Fixed discriminator so the composite foreign key can target Grant rows in the polymorphic `oidc_model_instances` table. */
  grant_model_name varchar(64) not null default 'Grant',
  organization_id varchar(21) not null,
  /** The user the grant was issued to and the membership FK's target. Must match the Grant payload's `accountId` (unreachable by FK) — the consent write enforces the pairing. */
  user_id varchar(21) not null,
  primary key (tenant_id, grant_id, organization_id),
  constraint cimd_grant_organizations__grant_model_name
    check (grant_model_name = 'Grant'),
  /** Revoking the grant hard-deletes the Grant row, which erases the organization authorization with it. */
  foreign key (tenant_id, grant_model_name, grant_id)
    references oidc_model_instances (tenant_id, model_name, id)
    on update cascade on delete cascade,
  /** Leaving the organization revokes the authorization. */
  foreign key (tenant_id, organization_id, user_id)
    references organization_user_relations (tenant_id, organization_id, user_id)
    on update cascade on delete cascade
);

/**
  Backs the membership FK's cascade lookup: rows live as long as the Grant row (not the grant's
  validity), so membership deletions would otherwise scan the tenant's whole row set per deleted
  membership, amplified by member count on organization deletion.
*/
create index cimd_grant_organizations__organization_id_user_id
  on cimd_grant_organizations (tenant_id, organization_id, user_id);
