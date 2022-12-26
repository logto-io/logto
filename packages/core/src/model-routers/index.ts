import { Hooks } from '@logto/schemas/lib/models/hooks.js';
import { createModelRouter } from '@withtyped/postgres';

import envSet from '#src/env-set/index.js';

const modelRouters = {
  hook: createModelRouter(Hooks, envSet.queryClient).withCrud(),
};

export default modelRouters;
