import { emailTemplateDetailsGuard, EmailTemplates } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

const pathPrefix = '/email-templates';

export default function emailTemplateRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { emailTemplates: emailTemplatesQueries } = queries;

  router.put(
    pathPrefix,
    koaGuard({
      body: z.object({
        templates: EmailTemplates.createGuard
          .omit({
            id: true,
            tenantId: true,
            createdAt: true,
          })
          .array()
          .min(1),
      }),
      response: EmailTemplates.guard.array(),
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      ctx.body = await emailTemplatesQueries.upsertMany(
        body.templates.map((template) => ({
          id: generateStandardId(),
          ...template,
        }))
      );
      return next();
    }
  );

  router.get(
    pathPrefix,
    koaGuard({
      query: EmailTemplates.guard
        .pick({
          languageTag: true,
          templateType: true,
        })
        .partial(),
      response: EmailTemplates.guard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const { query } = ctx.guard;
      ctx.body = await emailTemplatesQueries.findAllWhere(query);
      return next();
    }
  );

  router.get(
    `${pathPrefix}/:id`,
    koaGuard({
      params: z.object({
        id: z.string(),
      }),
      response: EmailTemplates.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      ctx.body = await emailTemplatesQueries.findById(id);
      return next();
    }
  );

  router.patch(
    `${pathPrefix}/:id/details`,
    koaGuard({
      params: z.object({
        id: z.string(),
      }),
      body: emailTemplateDetailsGuard.partial(),
      response: EmailTemplates.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { details } = await emailTemplatesQueries.findById(id);

      ctx.body = await emailTemplatesQueries.updateById(id, {
        details: {
          ...details,
          ...body,
        },
      });

      return next();
    }
  );

  router.delete(
    `${pathPrefix}/:id`,
    koaGuard({
      params: z.object({
        id: z.string(),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      await emailTemplatesQueries.deleteById(id);
      ctx.status = 204;
      return next();
    }
  );

  router.delete(
    `${pathPrefix}/language-tag/:languageTag`,
    koaGuard({
      params: z.object({
        languageTag: z.string(),
      }),
      status: [200],
      response: z.object({
        rowCount: z.number(),
      }),
    }),
    async (ctx, next) => {
      const {
        params: { languageTag },
      } = ctx.guard;
      ctx.body = await emailTemplatesQueries.deleteMany({ languageTag });
      return next();
    }
  );

  router.delete(
    `${pathPrefix}/template-type/:templateType`,
    koaGuard({
      params: EmailTemplates.guard.pick({
        templateType: true,
      }),
      status: [200],
      response: z.object({
        rowCount: z.number(),
      }),
    }),
    async (ctx, next) => {
      const {
        params: { templateType },
      } = ctx.guard;

      ctx.body = await emailTemplatesQueries.deleteMany({ templateType });
      return next();
    }
  );
}
