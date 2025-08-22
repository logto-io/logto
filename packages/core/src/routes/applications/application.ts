// TODO: @darcyYe refactor this file later to remove disable max line comment
/* eslint-disable max-lines */
import type { Role, Application } from '@logto/schemas';
import {
  Applications,
  ApplicationType,
  buildDemoAppDataForTenant,
  demoAppApplicationId,
  hasSecrets,
  InternalRole,
} from '@logto/schemas';
import { generateStandardId, generateStandardSecret } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { boolean, object, string, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { buildOidcClientMetadata } from '#src/oidc/utils.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import { EnvSet } from '../../env-set/index.js';
import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

import applicationCustomDataRoutes from './application-custom-data.js';
import { generateInternalSecret } from './application-secret.js';
import { applicationCreateGuard, applicationPatchGuard } from './types.js';

const includesInternalAdminRole = (roles: Readonly<Array<{ role: Role }>>) =>
  roles.some(({ role: { name } }) => name === InternalRole.Admin);

const parseIsThirdPartQueryParam = (isThirdPartyQuery: 'true' | 'false' | undefined) => {
  if (isThirdPartyQuery === undefined) {
    return;
  }

  return isThirdPartyQuery === 'true';
};

const hideOidcClientMetadataForSamlApp = (application: Application) => {
  return {
    ...application,
    ...conditional(
      application.type === ApplicationType.SAML && {
        oidcClientMetadata: buildOidcClientMetadata(),
      }
    ),
  };
};

const hideOidcClientMetadataForSamlApps = (applications: readonly Application[]) => {
  return applications.map((application) => hideOidcClientMetadataForSamlApp(application));
};

const applicationTypeGuard = z.nativeEnum(ApplicationType);

export default function applicationRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries,
    id: tenantId,
    libraries: { quota, protectedApps },
  } = tenant;

  router.get(
    '/applications',
    koaPagination({ isOptional: true }),
    koaGuard({
      query: object({
        /**
         * We treat the `types` query param as an array, but it will be parsed as string-typed
         * value if only one type is specified, manually convert to ApplicationType array.
         */
        types: applicationTypeGuard
          .array()
          .or(applicationTypeGuard.transform((type) => [type]))
          .optional(),
        excludeRoleId: string().optional(),
        excludeOrganizationId: string().optional(),
        isThirdParty: z.union([z.literal('true'), z.literal('false')]).optional(),
      }),
      response: z.array(Applications.guard),
      status: 200,
    }),
    async (ctx, next) => {
      const { limit, offset, disabled: paginationDisabled } = ctx.pagination;
      const { searchParams } = ctx.URL;
      const {
        types,
        excludeRoleId,
        excludeOrganizationId,
        isThirdParty: isThirdPartyParam,
      } = ctx.guard.query;

      if (excludeRoleId && excludeOrganizationId) {
        throw new RequestError({
          code: 'request.invalid_input',
          status: 400,
          details:
            'Parameter `excludeRoleId` and `excludeOrganizationId` cannot be used at the same time.',
        });
      }

      const isThirdParty = parseIsThirdPartQueryParam(isThirdPartyParam);

      // This will only parse the `search` query param, other params will be ignored. Please use query guard to validate them.
      const search = parseSearchParamsForSearch(searchParams);

      const excludeApplicationsRoles = excludeRoleId
        ? await queries.applicationsRoles.findApplicationsRolesByRoleId(excludeRoleId)
        : [];

      const excludeApplicationIds = excludeApplicationsRoles.map(
        ({ applicationId }) => applicationId
      );

      if (paginationDisabled) {
        const rawApplications = await queries.applications.findApplications({
          search,
          excludeApplicationIds,
          excludeOrganizationId,
          types,
          isThirdParty,
        });
        ctx.body = hideOidcClientMetadataForSamlApps(rawApplications);

        return next();
      }

      const [{ count }, applications] = await Promise.all([
        queries.applications.countApplications({
          search,
          excludeApplicationIds,
          excludeOrganizationId,
          isThirdParty,
          types,
        }),
        queries.applications.findApplications(
          {
            search,
            excludeApplicationIds,
            excludeOrganizationId,
            types,
            isThirdParty,
          },
          { limit, offset }
        ),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.body = hideOidcClientMetadataForSamlApps(applications);

      return next();
    }
  );

  router.post(
    '/applications',
    koaGuard({
      body: applicationCreateGuard,
      response: Applications.guard,
      status: [200, 400, 422, 403, 500],
    }),
    // eslint-disable-next-line complexity
    async (ctx, next) => {
      const { oidcClientMetadata, protectedAppMetadata, ...rest } = ctx.guard.body;

      if (rest.type === ApplicationType.SAML) {
        throw new RequestError('application.saml.use_saml_app_api');
      }

      await Promise.all([
        rest.type === ApplicationType.MachineToMachine &&
          quota.guardTenantUsageByKey('machineToMachineLimit'),
        rest.isThirdParty && quota.guardTenantUsageByKey('thirdPartyApplicationsLimit'),
        quota.guardTenantUsageByKey('applicationsLimit'),
      ]);

      assertThat(
        rest.type !== ApplicationType.Protected || protectedAppMetadata,
        'application.protected_app_metadata_is_required'
      );

      if (rest.isThirdParty) {
        assertThat(
          rest.type === ApplicationType.Traditional,
          'application.invalid_third_party_application_type'
        );
      }

      const application = await queries.applications.insertApplication({
        id: generateStandardId(),
        secret: generateInternalSecret(),
        oidcClientMetadata: buildOidcClientMetadata(oidcClientMetadata),
        ...conditional(
          rest.type === ApplicationType.Protected &&
            protectedAppMetadata &&
            (await protectedApps.buildProtectedAppData(protectedAppMetadata))
        ),
        ...rest,
      });

      if (hasSecrets(application.type)) {
        await queries.applicationSecrets.insert({
          name: 'Default secret',
          applicationId: application.id,
          value: generateStandardSecret(),
        });
      }

      if (application.type === ApplicationType.Protected) {
        try {
          await protectedApps.syncAppConfigsToRemote(application.id);
        } catch (error: unknown) {
          // Delete the application if failed to sync to remote
          await queries.applications.deleteApplicationById(application.id);
          throw error;
        }
      }

      ctx.body = application;

      if (rest.type === ApplicationType.MachineToMachine) {
        void quota.reportSubscriptionUpdatesUsage('machineToMachineLimit');
      }

      // TODO: remove this dev feature guard when new pro plan and add-on skus are ready.
      if (EnvSet.values.isDevFeaturesEnabled && rest.isThirdParty) {
        void quota.reportSubscriptionUpdatesUsage('thirdPartyApplicationsLimit');
      }

      return next();
    }
  );

  router.get(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: Applications.guard.merge(z.object({ isAdmin: z.boolean() })),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      // Somethings console needs to display demo app info. Build a fixed one for it.
      if (id === demoAppApplicationId) {
        ctx.body = { ...buildDemoAppDataForTenant(tenantId), isAdmin: false };

        return next();
      }

      const application = await queries.applications.findApplicationById(id);
      const applicationsRoles =
        await queries.applicationsRoles.findApplicationsRolesByApplicationId(id);

      ctx.body = {
        ...hideOidcClientMetadataForSamlApp(application),
        isAdmin: includesInternalAdminRole(applicationsRoles),
      };

      return next();
    }
  );

  router.patch(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: applicationPatchGuard.merge(
        object({
          isAdmin: boolean().optional(),
        })
      ),
      response: Applications.guard,
      status: [200, 400, 404, 422, 500],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { isAdmin, protectedAppMetadata, ...rest } = body;

      const pendingUpdateApplication = await queries.applications.findApplicationById(id);
      if (pendingUpdateApplication.type === ApplicationType.SAML) {
        throw new RequestError('application.saml.use_saml_app_api');
      }

      // @deprecated
      // User can enable the admin access of Machine-to-Machine apps by switching on a toggle on Admin Console.
      // Since those apps sit in the user tenant, we provide an internal role to apply the necessary scopes.
      // This role is NOT intended for user assignment.
      if (isAdmin !== undefined) {
        const [applicationsRoles, internalAdminRole] = await Promise.all([
          queries.applicationsRoles.findApplicationsRolesByApplicationId(id),
          queries.roles.findRoleByRoleName(InternalRole.Admin),
        ]);
        const usedToBeAdmin = includesInternalAdminRole(applicationsRoles);

        assertThat(
          internalAdminRole,
          new RequestError({
            code: 'entity.not_exists',
            status: 500,
            data: { name: InternalRole.Admin },
          })
        );

        if (isAdmin && !usedToBeAdmin) {
          await queries.applicationsRoles.insertApplicationsRoles([
            { id: generateStandardId(), applicationId: id, roleId: internalAdminRole.id },
          ]);
        } else if (!isAdmin && usedToBeAdmin) {
          await queries.applicationsRoles.deleteApplicationRole(id, internalAdminRole.id);
        }
      }

      if (protectedAppMetadata) {
        const { type, protectedAppMetadata: originProtectedAppMetadata } = pendingUpdateApplication;
        assertThat(type === ApplicationType.Protected, 'application.protected_application_only');
        assertThat(
          originProtectedAppMetadata,
          new RequestError({
            code: 'application.protected_application_misconfigured',
            status: 422,
          })
        );
        await queries.applications.updateApplicationById(id, {
          protectedAppMetadata: {
            ...originProtectedAppMetadata,
            ...protectedAppMetadata,
          },
        });
        try {
          await protectedApps.syncAppConfigsToRemote(id);
        } catch (error: unknown) {
          // Revert changes on sync failure
          await queries.applications.updateApplicationById(id, {
            protectedAppMetadata: originProtectedAppMetadata,
          });
          throw error;
        }
      }

      ctx.body =
        Object.keys(rest).length > 0
          ? await queries.applications.updateApplicationById(id, rest, 'replace')
          : pendingUpdateApplication;

      return next();
    }
  );

  router.delete(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: z.undefined(),
      status: [204, 400, 404, 422],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { type, protectedAppMetadata, isThirdParty } =
        await queries.applications.findApplicationById(id);

      if (type === ApplicationType.SAML) {
        throw new RequestError('application.saml.use_saml_app_api');
      }

      if (type === ApplicationType.Protected && protectedAppMetadata) {
        assertThat(
          !protectedAppMetadata.customDomains || protectedAppMetadata.customDomains.length === 0,
          'application.should_delete_custom_domains_first',
          422
        );
        await protectedApps.deleteRemoteAppConfigs(protectedAppMetadata.host);
      }
      // Note: will need delete cascade when application is joint with other tables
      await queries.applications.deleteApplicationById(id);
      ctx.status = 204;

      if (type === ApplicationType.MachineToMachine) {
        void quota.reportSubscriptionUpdatesUsage('machineToMachineLimit');
      }

      // TODO: remove this dev feature guard when new pro plan and add-on skus are ready.
      if (EnvSet.values.isDevFeaturesEnabled && isThirdParty) {
        void quota.reportSubscriptionUpdatesUsage('thirdPartyApplicationsLimit');
      }

      return next();
    }
  );

  applicationCustomDataRoutes(router, tenant);
}
/* eslint-enable max-lines */
