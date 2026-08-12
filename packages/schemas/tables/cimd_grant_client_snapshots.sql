/* init_order = 2 */

/**
  The client identity a user approved at consent time for a client ID metadata document (CIMD)
  client, captured per Grant. CIMD clients are unregistered URL identities without an
  `applications` row, and an unvetted client can rewrite its hosted document at any time — so the
  grant list renders this snapshot instead of refetching the document.
*/
create table cimd_grant_client_snapshots (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The ID of the Grant row in `oidc_model_instances`. */
  grant_id varchar(128) not null,
  /** Fixed discriminator so the composite foreign key can target Grant rows in the polymorphic `oidc_model_instances` table. */
  grant_model_name varchar(64) not null default 'Grant',
  client_id varchar(2048) not null,
  name varchar(256),
  logo_uri varchar(2048),
  created_at timestamptz not null default(now()),
  primary key (tenant_id, grant_id),
  constraint cimd_grant_client_snapshots__grant_model_name
    check (grant_model_name = 'Grant'),
  /** Revoking the grant hard-deletes the Grant row, which erases the snapshot with it. */
  foreign key (tenant_id, grant_model_name, grant_id)
    references oidc_model_instances (tenant_id, model_name, id)
    on update cascade on delete cascade
);
