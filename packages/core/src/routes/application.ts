import { Applications, SnakeCaseOidcConfig } from '@logto/schemas';
import camelcaseKeys from 'camelcase-keys';
import got from 'got';
import { object, string } from 'zod';

import { port } from '@/env/consts';
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

const discoveryUrl = `http://localhost:${port}/oidc/.well-known/openid-configuration`;

export default function applicationRoutes<T extends AuthedRouter>(router: T) {
  router.get('/applications', koaPagination(), async (ctx, next) => {
    const { limit, offset } = ctx.pagination;

    const [{ count }, applications, oidcConfig] = await Promise.all([
      findTotalNumberOfApplications(),
      findAllApplications(limit, offset),
      got(discoveryUrl).json<SnakeCaseOidcConfig>(),
    ]);

    // Return totalCount to pagination middleware
    ctx.pagination.totalCount = count;
    ctx.body = applications.map((application) => ({
      ...application,
      oidcConfig: camelcaseKeys(oidcConfig),
    }));

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

      const [application, oidcConfig] = await Promise.all([
        insertApplication({
          id: applicationId(),
          oidcClientMetadata: buildOidcClientMetadata(oidcClientMetadata),
          ...rest,
        }),
        got(discoveryUrl).json<SnakeCaseOidcConfig>(),
      ]);

      ctx.body = {
        ...application,
        oidcConfig: camelcaseKeys(oidcConfig),
      };

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

      const [application, oidcConfig] = await Promise.all([
        findApplicationById(id),
        got(discoveryUrl).json<SnakeCaseOidcConfig>(),
      ]);

      ctx.body = {
        ...application,
        oidcConfig: camelcaseKeys(oidcConfig),
      };

      return next();
    }
  );

  router.patch(
    '/applications/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Applications.createGuard.omit({ id: true, createdAt: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const [application, oidcConfig] = await Promise.all([
        updateApplicationById(id, {
          ...body,
        }),
        got(discoveryUrl).json<SnakeCaseOidcConfig>(),
      ]);

      ctx.body = {
        ...application,
        oidcConfig: camelcaseKeys(oidcConfig),
      };

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
