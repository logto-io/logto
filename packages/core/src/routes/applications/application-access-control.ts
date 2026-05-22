import { applicationAccessControlGuard, type ApplicationAccessControl } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard, { parse } from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

// Keep this OpenAPI-friendly guard in sync with the canonical guard below. The canonical guard
// uses transforms for dedupe/merge/limits, which do not round-trip cleanly through OpenAPI output.
const applicationAccessControlOpenApiGuard = z.object({
  userIds: z.array(z.string()),
  userRoleIds: z.array(z.string()),
  organizationIds: z.array(z.string()),
  organizationRoleRules: z.array(
    z.object({
      organizationId: z.string(),
      organizationRoleIds: z.array(z.string()),
    })
  ),
}) satisfies z.ZodType<ApplicationAccessControl>;

const applicationAccessControlBodyGuard: z.ZodType<ApplicationAccessControl> =
  applicationAccessControlGuard;

const assertNonEmptyOrganizationRoleRules = ({
  organizationRoleRules,
}: ApplicationAccessControl) => {
  const emptyRule = organizationRoleRules.find(
    ({ organizationRoleIds }) => organizationRoleIds.length === 0
  );

  assertThat(
    !emptyRule,
    new RequestError({
      code: 'request.invalid_input',
      status: 422,
      details: 'Organization-role rule groups must include at least one organization role.',
      ...conditional(emptyRule && { organizationId: emptyRule.organizationId }),
    })
  );
};

export default function applicationAccessControlRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    applications: { findApplicationById },
    applicationAccessControl: { findApplicationAccessControl, replaceApplicationAccessControl },
  } = queries;

  const pathname = '/applications/:applicationId/access-control';
  const params = z.object({ applicationId: z.string().min(1) });

  router.use(pathname, koaGuard({ params }), async (_, next) => {
    assertThat(
      EnvSet.values.isDevFeaturesEnabled,
      new RequestError({ code: 'entity.not_found', status: 404 })
    );

    return next();
  });

  router.get(
    pathname,
    koaGuard({
      params,
      response: applicationAccessControlOpenApiGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { applicationId } = ctx.guard.params;

      await findApplicationById(applicationId);

      ctx.body = await findApplicationAccessControl(applicationId);

      return next();
    }
  );

  router.put(
    pathname,
    koaGuard({
      params,
      body: applicationAccessControlOpenApiGuard,
      response: applicationAccessControlOpenApiGuard,
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const { applicationId } = ctx.guard.params;
      const accessControl: ApplicationAccessControl = parse(
        'body',
        applicationAccessControlBodyGuard,
        ctx.guard.body
      );

      assertNonEmptyOrganizationRoleRules(accessControl);
      await findApplicationById(applicationId);

      await replaceApplicationAccessControl(applicationId, accessControl);

      ctx.body = accessControl;

      return next();
    }
  );
}
