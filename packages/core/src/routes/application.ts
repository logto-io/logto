import { Applications } from '@logto/schemas';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import { buildOidcClientMetadata } from '@/oidc/utils';
import {
  deleteApplicationById,
  findApplicationById,
  findAllApplications,
  insertApplication,
  updateApplicationById,
  findTotalNumberOfApplications,
} from '@/queries/application';
import { buildIdGenerator } from '@/utils/id';

import { AuthedRouter } from './types';

const applicationId = buildIdGenerator(21);

export default function applicationRoutes<T extends AuthedRouter>(router: T) {
  router.get('/applications', koaPagination(), async (ctx, next) => {
    const { limit, offset } = ctx.pagination;
    const { count } = await findTotalNumberOfApplications();

    if (offset >= count) {
      throw new RequestError({
        code: 'entity.not_exists',
        name: Applications.tableSingular,
        status: 404,
      });
    }

    // Return totalCount to pagination middleware
    ctx.pagination.totalCount = count;

    ctx.body = await findAllApplications(limit, offset);

    return next();
  });

  router.post(
    '/applications',
    koaGuard({
      body: Applications.guard
        .omit({ id: true, createdAt: true })
        .partial()
        .merge(Applications.guard.pick({ name: true, type: true })),
    }),
    async (ctx, next) => {
      const { name, type, oidcClientMetadata, ...rest } = ctx.guard.body;

      ctx.body = await insertApplication({
        id: applicationId(),
        type,
        name,
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
      body: Applications.guard.omit({ id: true, createdAt: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;
      const application = await findApplicationById(id);

      ctx.body = await updateApplicationById(id, {
        ...body,
        oidcClientMetadata: buildOidcClientMetadata({
          ...application.oidcClientMetadata,
          ...body.oidcClientMetadata,
        }),
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
      await deleteApplicationById(id);
      ctx.status = 204;
      return next();
    }
  );
}
