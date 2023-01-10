import { Hooks } from '@logto/schemas/models';
import { createModelRouter } from '@withtyped/postgres';
import type { QueryClient } from '@withtyped/server';

export type ModelRouters = ReturnType<typeof createModelRouters>;

export const createModelRouters = (queryClient: QueryClient) => ({
  hook: createModelRouter(Hooks, queryClient).withCrud(),
});
