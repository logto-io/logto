import { Organizations } from '@logto/schemas';

import SchemaRouter from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from './types.js';

export default function organizationRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: { organizations },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(Organizations, {
    get: async ({ limit, offset }) =>
      Promise.all([organizations.findTotalNumber(), organizations.findAll(limit, offset)]),
    getById: organizations.findById,
    post: organizations.insert,
    patchById: {
      guard: Organizations.guard.omit({ id: true, createdAt: true }).partial(),
      run: organizations.updateById,
    },
    deleteById: organizations.deleteById,
  });

  originalRouter.use(router.routes());
}
