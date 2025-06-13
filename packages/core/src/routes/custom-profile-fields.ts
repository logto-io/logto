import {
  CustomProfileFields,
  createCustomProfileFieldDataGuard,
  updateCustomProfileFieldDataGuard,
  updateCustomProfileFieldSieOrderGuard,
} from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function customProfileFieldsRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    findAllCustomProfileFields,
    findCustomProfileFieldById,
    updateCustomProfileFieldsById,
    deleteCustomProfileFieldsById,
  } = queries.customProfileFields;

  const { createCustomProfileField, updateCustomProfileFieldsSieOrder } =
    libraries.customProfileFields;

  router.get(
    '/custom-profile-fields',
    koaGuard({
      response: z.array(CustomProfileFields.guard),
      status: [200],
    }),
    async (ctx, next) => {
      ctx.body = await findAllCustomProfileFields();
      ctx.status = 200;
      return next();
    }
  );

  router.get(
    '/custom-profile-fields/:id',
    koaGuard({
      params: z.object({
        id: z.string().min(1),
      }),
      response: CustomProfileFields.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { params } = ctx.guard;

      ctx.body = await findCustomProfileFieldById(params.id);
      ctx.status = 200;
      return next();
    }
  );
  router.post(
    '/custom-profile-fields',
    koaGuard({
      body: createCustomProfileFieldDataGuard,
      response: CustomProfileFields.guard,
      status: [201],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;

      ctx.body = await createCustomProfileField(body);
      ctx.status = 201;
      return next();
    }
  );

  router.patch(
    '/custom-profile-fields/:id',
    koaGuard({
      params: z.object({
        id: z.string().min(1),
      }),
      body: updateCustomProfileFieldDataGuard,
      response: CustomProfileFields.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { params, body } = ctx.guard;
      const { id } = params;

      const customProfileField = await updateCustomProfileFieldsById({
        where: { id },
        set: body,
        jsonbMode: 'merge',
      });

      ctx.body = customProfileField;
      ctx.status = 200;
      return next();
    }
  );

  router.delete(
    '/custom-profile-fields/:id',
    koaGuard({
      params: z.object({
        id: z.string().min(1),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const { params } = ctx.guard;
      const { id } = params;

      await deleteCustomProfileFieldsById(id);

      ctx.status = 204;
      return next();
    }
  );

  router.put(
    '/custom-profile-fields/sie-order',
    koaGuard({
      body: z.object({
        order: z.array(updateCustomProfileFieldSieOrderGuard),
      }),
      response: z.array(CustomProfileFields.guard),
      status: [200],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const customProfileFields = await updateCustomProfileFieldsSieOrder(body.order);

      ctx.status = 200;
      ctx.body = customProfileFields;
      return next();
    }
  );
}
