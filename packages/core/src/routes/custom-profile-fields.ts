import {
  CustomProfileFields,
  updateCustomProfileFieldSieOrderGuard,
  customProfileFieldUnionGuard,
  updateCustomProfileFieldDataGuard,
} from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../errors/RequestError/index.js';
import { koaQuotaGuard } from '../middleware/koa-quota-guard.js';
import assertThat from '../utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// Maximum number of items allowed in a single batch creation request.
// Name kept generic since the route context already implies custom profile fields.
const batchItemsLimit = 20;

export default function customProfileFieldsRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    findAllCustomProfileFields,
    findCustomProfileFieldByName,
    deleteCustomProfileFieldsByName,
  } = queries.customProfileFields;

  const { createCustomProfileField, updateCustomProfileField, updateCustomProfileFieldsSieOrder } =
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
    '/custom-profile-fields/:name',
    koaGuard({
      params: z.object({
        name: z.string().min(1),
      }),
      response: CustomProfileFields.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { params } = ctx.guard;

      const result = await findCustomProfileFieldByName(params.name);

      assertThat(result, new RequestError({ code: 'entity.not_found', status: 404 }));

      ctx.body = result;
      ctx.status = 200;
      return next();
    }
  );

  router.post(
    '/custom-profile-fields',
    koaQuotaGuard({ key: 'collectUserProfileEnabled', quota: libraries.quota }),
    koaGuard({
      body: customProfileFieldUnionGuard,
      response: CustomProfileFields.guard,
      status: [201, 400],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;

      ctx.body = await createCustomProfileField(body);
      ctx.status = 201;
      return next();
    }
  );

  router.post(
    '/custom-profile-fields/batch',
    koaQuotaGuard({ key: 'collectUserProfileEnabled', quota: libraries.quota }),
    koaGuard({
      body: z.array(customProfileFieldUnionGuard).max(batchItemsLimit),
      response: z.array(CustomProfileFields.guard),
      status: [201, 400],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;

      const created = await libraries.customProfileFields.createCustomProfileFieldsBatch(body);
      ctx.body = created;
      ctx.status = 201;
      return next();
    }
  );

  router.put(
    '/custom-profile-fields/:name',
    koaGuard({
      params: z.object({
        name: z.string().min(1),
      }),
      body: updateCustomProfileFieldDataGuard,
      response: CustomProfileFields.guard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { params, body } = ctx.guard;

      const customProfileField = await updateCustomProfileField(params.name, body);

      ctx.body = customProfileField;
      ctx.status = 200;
      return next();
    }
  );

  router.delete(
    '/custom-profile-fields/:name',
    koaGuard({
      params: z.object({
        name: z.string().min(1),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const { params } = ctx.guard;

      await deleteCustomProfileFieldsByName(params.name);

      ctx.status = 204;
      return next();
    }
  );

  router.post(
    '/custom-profile-fields/properties/sie-order',
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
