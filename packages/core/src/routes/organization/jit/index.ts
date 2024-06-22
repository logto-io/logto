import { type OrganizationKeys, type CreateOrganization, type Organization } from '@logto/schemas';

import type OrganizationQueries from '#src/queries/organization/index.js';
import type SchemaRouter from '#src/utils/SchemaRouter.js';

import emailDomainRoutes from './email-domains.js';

/** Mounts the jit-related routes on the organization router. */
export default function jitRoutes(
  router: SchemaRouter<OrganizationKeys, CreateOrganization, Organization>,
  organizations: OrganizationQueries
) {
  emailDomainRoutes(router, organizations);
  router.addRelationRoutes(organizations.jit.roles, 'jit/roles', { isPaginationOptional: true });
  router.addRelationRoutes(organizations.jit.ssoConnectors, 'jit/sso-connectors', {
    isPaginationOptional: true,
  });
}
