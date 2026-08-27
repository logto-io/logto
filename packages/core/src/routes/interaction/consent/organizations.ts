import { ReservedResource, UserScope } from '@logto/core-kit';
import { type MissingResourceScopes, Organizations, type PublicOrganization } from '@logto/schemas';

import { type EnvSet } from '#src/env-set/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { filterAndParseMissingResourceScopes, parseMissingResourceScopesInfo } from './utils.js';

type GetConsentOrganizationsOptions = {
  envSet: EnvSet;
  queries: Queries;
  libraries: Libraries;
  cimd: boolean;
  userId: string;
  applicationId: string;
  /**
   * The `scope` parameter of the authorization request. Provider-owned interaction params are
   * untyped, so the value arrives as `unknown`; a non-string reads as "requested nothing",
   * matching how `revalidateConsentClient` treats the same parameter.
   */
  requestedScope: unknown;
  missingOIDCScope?: string[];
  /**
   * The requested scope ceiling from the prompt details, already bounded at authorization time
   * by the user's roles across all of their organizations.
   */
  allMissingResourceScopes: Record<string, string[]>;
};

/**
 * Build the organization roster of the consent page.
 *
 * A registered third-party consent records an application-wide ceiling plus a roster, so the
 * roster carries no per-organization scope detail: the effective access of each organization is
 * re-bounded by the user's role there at token issuance.
 */
export const getConsentOrganizations = async ({
  envSet,
  queries,
  libraries,
  cimd,
  userId,
  applicationId,
  requestedScope,
  missingOIDCScope,
  allMissingResourceScopes,
}: GetConsentOrganizationsOptions): Promise<PublicOrganization[]> => {
  /**
   * CIMD consent is grant-scoped per authorization (one grant carries one organization), so no
   * cross-grant roster applies. It keeps the pre-roster behavior verbatim: the missing-scope
   * gate and a per-organization scope breakdown.
   */
  if (cimd) {
    if (!missingOIDCScope?.includes(UserScope.Organizations)) {
      return [];
    }

    const organizations =
      await queries.organizations.relations.users.getOrganizationsByUserId(userId);

    return Promise.all(
      organizations.map(async ({ name, id }) => ({
        name,
        id,
        missingResourceScopes: await filterAndParseMissingResourceScopes({
          resourceScopes: allMissingResourceScopes,
          envSet,
          queries,
          libraries,
          userId,
          organizationId: id,
          applicationId,
        }),
      }))
    );
  }

  /**
   * The roster is gated on the requested `organizations` scope, not on its missing state: after
   * the first grant the scope is never missing again, yet a later consent round (e.g. a
   * `prompt=consent` re-authorization) must still offer the organizations that are not consented
   * yet. Missing scopes are computed from the requested set, so this check subsumes the legacy
   * missing-state gate. The consent prompt trigger itself is untouched, which keeps the resume
   * flow single-pass.
   */
  const requestedScopes = typeof requestedScope === 'string' ? requestedScope.split(' ') : [];

  if (!requestedScopes.includes(UserScope.Organizations)) {
    return [];
  }

  const organizations =
    await queries.organizations.relations.users.getOrganizationsByUserId(userId);

  if (organizations.length === 0) {
    return [];
  }

  const [, consentedOrganizations] =
    await queries.applications.userConsentOrganizations.getEntities(Organizations, {
      applicationId,
      userId,
    });
  const consentedOrganizationIds = new Set(consentedOrganizations.map(({ id }) => id));

  return organizations.map(({ name, id }) => ({
    name,
    id,
    isConsented: consentedOrganizationIds.has(id),
  }));
};

type GetOrganizationResourceScopesOptions = {
  queries: Queries;
  cimd: boolean;
  /** The roster the consent page will render. */
  organizations: PublicOrganization[];
  /** The requested scope ceiling from the prompt details. */
  allMissingResourceScopes: Record<string, string[]>;
  /** The user-level scope card of the consent page, which the organization-facing part excludes. */
  userMissingResourceScopes: MissingResourceScopes[];
};

/**
 * The organization-facing part of the requested scope ceiling, or `undefined` when this consent
 * response carries none: the card renders once above the organization roster, so it only
 * accompanies a non-empty registered third-party roster — CIMD organizations carry their own
 * scope breakdown instead.
 *
 * The reserved organization resource always belongs here, as the user-level card filters it out
 * of its own display. API resource scopes can be reachable both directly and through
 * organization roles, so they are deduplicated against what the user-level card already lists,
 * and groups left with no scopes are dropped.
 */
export const getOrganizationResourceScopes = async ({
  queries,
  cimd,
  organizations,
  allMissingResourceScopes,
  userMissingResourceScopes,
}: GetOrganizationResourceScopesOptions): Promise<MissingResourceScopes[] | undefined> => {
  if (cimd || organizations.length === 0) {
    return;
  }

  const requestedResourceScopes = await parseMissingResourceScopesInfo(
    queries,
    allMissingResourceScopes
  );

  return requestedResourceScopes
    .map(({ resource, scopes }) => {
      if (resource.id === ReservedResource.Organization) {
        return { resource, scopes };
      }

      const userCardScopes =
        userMissingResourceScopes.find(({ resource: { id } }) => id === resource.id)?.scopes ?? [];

      return {
        resource,
        scopes: scopes.filter((scope) => !userCardScopes.some(({ id }) => id === scope.id)),
      };
    })
    .filter(({ scopes }) => scopes.length > 0);
};
