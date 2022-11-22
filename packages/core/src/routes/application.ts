import { Applications } from '@logto/schemas';
import { buildApplicationSecret, buildIdGenerator } from '@logto/shared';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { buildOidcClientMetadata } from '#src/oidc/utils.js';
import {
  deleteApplicationById,
  findApplicationById,
  findAllApplications,
  insertApplication,
  updateApplicationById,
  findTotalNumberOfApplications,
} from '#src/queries/application.js';

import type { AuthedRouter } from './types.js';

const applicationId = buildIdGenerator(21);

export default function applicationRoutes<T extends AuthedRouter>(router: T) {
  router.get('/applications', koaPagination(), async (ctx, next) => {
    const { limit, offset } = ctx.pagination;

    const [{ count }, applications] = await Promise.all([
      findTotalNumberOfApplications(),
      findAllApplications(limit, offset),
    ]);

    // Return totalCount to pagination middleware
    ctx.pagination.totalCount = count;
    ctx.body = applications;

    return next();
  });

  router.post(
    '/applications',
    koaGuard({
      body: Applications.createGuard
        .omit({ id: true, createdAt: true })
        .partial()
        .merge(Applications.createGuard.pick({ name: true, type: true })),
    }),
    async (ctx, next) => {
      const { oidcClientMetadata, ...rest } = ctx.guard.body;

      ctx.body = await insertApplication({
        id: applicationId(),
        secret: buildApplicationSecret(),
        oidcClientMetadata: buildOidcClientMetadata(oidcClientMetadata),
        ...rest,
      });

      return next();
    }
  );

  router.get(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findApplicationById(id);

      return next();
    }
  );

  router.patch(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Applications.createGuard.omit({ id: true, createdAt: true }).deepPartial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      ctx.body = await updateApplicationById(id, {
        ...body,
      });

      return next();
    }
  );

  router.delete(
    '/applications/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      // Note: will need delete cascade when application is joint with other tables
      await findApplicationById(id);
      await deleteApplicationById(id);
      ctx.status = 204;

      return next();
    }
  );
}
