import { type OrganizationKeys, type CreateOrganization, type Organization } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import type SchemaRouter from '#src/utils/SchemaRouter.js';

import applicationRoleRelationRoutes from './role-relations.js';

/** Mounts the application-related routes on the organization router. */
export default function applicationRoutes(
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizations: OrganizationQueries
) {
  if (EnvSet.values.isDevFeaturesEnabled) {
    // MARK: Organization - application relation routes
    router.addRelationRoutes(organizations.relations.apps, undefined, {
      hookEvent: 'Organization.Membership.Updated',
    });

    // MARK: Organization - application role relation routes
    applicationRoleRelationRoutes(router, organizations);
  }
}
