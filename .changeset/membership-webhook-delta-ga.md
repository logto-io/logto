---
"@logto/core": minor
---

enrich `Organization.Membership.Updated` webhook payload with explicit delta fields describing the exact membership change:

- `addedUserIds` / `removedUserIds` on `POST /organizations/:id/users`, `PUT /organizations/:id/users`, and `DELETE /organizations/:id/users/:userId`.
- `addedApplicationIds` / `removedApplicationIds` on `POST /organizations/:id/applications`, `PUT /organizations/:id/applications`, and `DELETE /organizations/:id/applications/:applicationId`.
- `addedUserIds` on invitation accept (`PUT /organization-invitations/:id/status`) and experience-flow just-in-time provisioning (email-domain JIT and enterprise SSO JIT during sign-up / sign-in).

Each delta array is capped silently at 5000 entries; for bulk operations that exceed the cap, consumers should reconcile authoritative membership via `GET /organizations/:id/users` or `GET /organizations/:id/applications`. Empty deltas are omitted from the payload entirely, and consumers must treat a missing field as "no change on that side," not as "an empty change." The `PUT` replace handlers report the truly-new and truly-removed IDs (not the entire declared set). Re-accepting an invitation by a user who is already a member still produces the legacy `{ organizationId }`-only shape.

No breaking change: the four delta fields are additive optional fields; the previously emitted `data: null` field is unchanged. See the [webhook reference](https://docs.logto.io/developers/webhooks/webhooks-request#organizationmembershipupdated-payload) for the full payload contract.

Supersedes #8752, thanks @chiche84.
