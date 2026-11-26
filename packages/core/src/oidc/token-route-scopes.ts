import { ReservedResource } from '@logto/core-kit';

import { type EnvSet } from '#src/env-set/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { shouldTreatAsCimdClient } from './cimd/index.js';

export type ScopeEntity = Readonly<{ id: string; name: string }>;

/**
 * OIDC routes belonging to the authorization / consent stage, where no single target organization
 * has been selected yet and personal + organization candidate scopes are combined when populating
 * the flat Grant.
 *
 * Every other route — including `token`, `pushed_authorization_request`, `device_authorization`,
 * `backchannel_authentication`, and any unrecognized or missing route — fails closed into isolated
 * token-route scope resolution for third-party and CIMD clients.
 *
 * Note: `pushed_authorization_request` and `device_authorization` also call `getResourceServerInfo`
 * via `checkResource` in `oidc-provider`, solely to validate resource indicators without persisting
 * resource scopes, so falling into isolated mode there is harmless.
 */
export const consentAuthorizationRoutes: ReadonlySet<string> = new Set([
  'authorization',
  'resume',
  'code_verification',
  'device_resume',
]);

export const isConsentAuthorizationRoute = (route?: string): boolean =>
  route !== undefined && consentAuthorizationRoutes.has(route);

type BaseResolveParams = {
  envSet: EnvSet;
  queries: Queries;
  clientId: string;
  userId?: string;
};

type ResolveThirdPartyTokenScopesParams = BaseResolveParams &
  (
    | {
        /** Resource indicator for Cases 1 (personal API), 2 (org API), and 4 (reserved org resource). */
        indicator: string;
        organizationId?: string;
        libraries: Pick<Libraries, 'applications' | 'users'>;
      }
    | {
        /** Omitted indicator for Case 3 (organization token). */
        indicator?: undefined;
        organizationId: string;
        libraries: Pick<Libraries, 'applications'>;
      }
  );

const intersectScopesById = (
  roleScopes: readonly ScopeEntity[],
  allowedScopes: readonly ScopeEntity[]
): readonly ScopeEntity[] => {
  const allowedScopeIds = new Set(allowedScopes.map(({ id }) => id));
  return roleScopes.filter(({ id }) => allowedScopeIds.has(id));
};

const getAllowedApiResourceScopes = async ({
  treatAsCimdClient,
  queries,
  libraries,
  clientId,
  indicator,
  isOrganizationContext,
}: {
  treatAsCimdClient: boolean;
  queries: Queries;
  libraries: Pick<Libraries, 'applications'>;
  clientId: string;
  indicator: string;
  isOrganizationContext: boolean;
}): Promise<readonly ScopeEntity[]> => {
  if (treatAsCimdClient) {
    return isOrganizationContext
      ? queries.cimd.organizationResourceScopes.findAll()
      : queries.cimd.resourceScopes.findAll();
  }

  const consentedResources = isOrganizationContext
    ? await libraries.applications.getApplicationUserConsentOrganizationResourceScopes(clientId)
    : await libraries.applications.getApplicationUserConsentResourceScopes(clientId);

  return consentedResources.find(({ resource }) => resource.indicator === indicator)?.scopes ?? [];
};

/**
 * Unified token-route scope resolver for registered third-party applications and CIMD clients.
 *
 * Computes `live user roles ∩ live config source` (per-application consent configuration for
 * registered third-party apps; tenant-wide CIMD ceiling for CIMD clients) strictly isolated by
 * token context:
 *
 * - Case 1 (`indicator` without `organizationId`): personal global roles only ∩ personal API config.
 * - Case 2 (`indicator` + `organizationId`): live target organization roles only ∩ org API config.
 * - Case 3 (`organizationId` without `indicator`): live target organization roles ∩ org scope config
 *   (callers additionally intersect with `Grant[ReservedResource.Organization]`).
 * - Case 4 (`indicator === ReservedResource.Organization`): empty scope on token routes (covers
 *   both explicit `params.resource` and implicit `resolve_resource.js` fallback for OAuth-only
 *   clients omitting `openid`, without throwing `invalid_target`).
 */
export const resolveThirdPartyTokenScopes = async (
  params: ResolveThirdPartyTokenScopesParams
): Promise<readonly ScopeEntity[]> => {
  const { envSet, queries, clientId, userId, indicator, organizationId } = params;

  // Case 4: `ReservedResource.Organization` is a virtual consent-only indicator.
  if (indicator === ReservedResource.Organization) {
    return [];
  }

  // Fail closed when no user subject is present (e.g. PAR / device_authorization where
  // `checkResource` runs without a user session).
  if (!userId) {
    return [];
  }

  const treatAsCimdClient = shouldTreatAsCimdClient(envSet, clientId);

  // Case 3: Organization token (`organization_id` present, `resource` absent).
  if (indicator === undefined) {
    const [roleScopes, allowedScopes] = await Promise.all([
      queries.organizations.relations.usersRoles.getUserScopes(organizationId, userId),
      treatAsCimdClient
        ? queries.cimd.organizationScopes.findAll()
        : params.libraries.applications.getApplicationUserConsentOrganizationScopes(clientId),
    ]);

    return intersectScopesById(roleScopes, allowedScopes);
  }

  // Case 2: Organization API token (`resource` + `organization_id`).
  if (organizationId) {
    const [roleScopes, allowedScopes] = await Promise.all([
      queries.organizations.relations.usersRoles.getUserResourceScopes(
        userId,
        indicator,
        organizationId
      ),
      getAllowedApiResourceScopes({
        treatAsCimdClient,
        queries,
        libraries: params.libraries,
        clientId,
        indicator,
        isOrganizationContext: true,
      }),
    ]);

    return intersectScopesById(roleScopes, allowedScopes);
  }

  // Case 1: Personal API token (`resource` without `organization_id`).
  const [roleScopes, allowedScopes] = await Promise.all([
    params.libraries.users.findUserScopesForResourceIndicator(userId, indicator, false),
    getAllowedApiResourceScopes({
      treatAsCimdClient,
      queries,
      libraries: params.libraries,
      clientId,
      indicator,
      isOrganizationContext: false,
    }),
  ]);

  return intersectScopesById(roleScopes, allowedScopes);
};
