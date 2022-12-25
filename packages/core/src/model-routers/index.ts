import { Hooks } from '@logto/schemas/models';
import { createModelRouter } from '@withtyped/postgres';

import envSet from '#src/env-set/index.js';

const modelRouters = {
  hook: createModelRouter(Hooks, envSet.queryClient).withCrud(),
};

export default modelRouters;
