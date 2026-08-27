import { ReservedResource, UserScope } from '@logto/core-kit';
import { type MissingResourceScopes, Organizations, type PublicOrganization } from '@logto/schemas';

import { type EnvSet } from '#src/env-set/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { filterAndParseMissingResourceScopes, parseMissingResourceScopesInfo } from './utils.js';

type BuildConsentOrganizationsOptions = {
  envSet: EnvSet;
  queries: Queries;
  libraries: Libraries;
  cimd: boolean;
  userId: string;
  applicationId: string;
  /** The `scope` parameter of the authorization request. */
  requestedScope: unknown;
  missingOIDCScope?: string[];
  /**
   * The requested scope ceiling from the prompt details, already bounded at authorization time by
   * the user's roles across all of their organizations.
   */
  allMissingResourceScopes: Record<string, string[]>;
  /** The user-level scope card of the consent page, which the organization-facing part excludes. */
  userMissingResourceScopes: MissingResourceScopes[];
};

/**
 * Build the organization roster of the consent page, along with the organization-facing part of
 * the requested scope ceiling.
 *
 * A registered third-party consent records an application-wide ceiling plus a roster, so the
 * roster carries no per-organization scope detail: the effective access of each organization is
 * re-bounded by the user's role there at token issuance. CIMD consent is grant-scoped per
 * authorization, and keeps the per-organization breakdown its model displays.
 */
export const buildConsentOrganizations = async ({
  envSet,
  queries,
  libraries,
  cimd,
  userId,
  applicationId,
  requestedScope,
  missingOIDCScope,
  allMissingResourceScopes,
  userMissingResourceScopes,
}: BuildConsentOrganizationsOptions): Promise<{
  organizations: PublicOrganization[];
  organizationResourceScopes?: MissingResourceScopes[];
}> => {
  /**
   * The roster is gated on the requested `organizations` scope rather than on its missing state
   * alone: after the first grant the scope is never missing again, yet a later consent round
   * (e.g. a `prompt=consent` re-authorization) must still offer the organizations that are not
   * consented yet, so the selection stays amendable. The consent prompt trigger itself is
   * untouched, which keeps the resume flow single-pass. A CIMD authorization consents exactly
   * one organization to its own grant, so it keeps the missing-scope gate.
   */
  const wantsOrganizations =
    Boolean(missingOIDCScope?.includes(UserScope.Organizations)) ||
    (!cimd &&
      typeof requestedScope === 'string' &&
      requestedScope.split(' ').includes(UserScope.Organizations));

  const organizations = wantsOrganizations
    ? await queries.organizations.relations.users.getOrganizationsByUserId(userId)
    : [];

  if (cimd) {
    return {
      organizations: await Promise.all(
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
      ),
    };
  }

  if (organizations.length === 0) {
    return { organizations: [] };
  }

  const [, consentedOrganizations] =
    await queries.applications.userConsentOrganizations.getEntities(Organizations, {
      applicationId,
      userId,
    });
  const consentedOrganizationIds = new Set(consentedOrganizations.map(({ id }) => id));

  /**
   * The reserved organization resource always belongs to the organization-facing part; API
   * resource scopes may be carried by an organization role as well as directly by the user, so
   * they are deduplicated against what the user-level card already lists.
   */
  const requestedResourceScopes = await parseMissingResourceScopesInfo(
    queries,
    allMissingResourceScopes
  );
  const organizationResourceScopes = requestedResourceScopes
    .map(({ resource, scopes }) => ({
      resource,
      scopes:
        resource.id === ReservedResource.Organization
          ? scopes
          : scopes.filter(
              (scope) =>
                !userMissingResourceScopes.some(
                  ({ resource: userResource, scopes: userScopes }) =>
                    userResource.id === resource.id && userScopes.some(({ id }) => id === scope.id)
                )
            ),
    }))
    .filter(({ scopes }) => scopes.length > 0);

  return {
    organizations: organizations.map(({ name, id }) => ({
      name,
      id,
      isConsented: consentedOrganizationIds.has(id),
    })),
    organizationResourceScopes,
  };
};
